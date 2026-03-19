-- ============================================================
-- KiranaAI — Initial Database Schema
-- ============================================================
-- Run this migration in your Supabase SQL Editor or via CLI.
-- All tables use UUID primary keys and enforce referential integrity.
-- ============================================================

-- ─── Stores ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stores (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name          TEXT NOT NULL,
  store_name          TEXT NOT NULL,
  phone               TEXT UNIQUE NOT NULL,
  upi_vpa             TEXT NOT NULL,
  preferred_language   TEXT NOT NULL DEFAULT 'hi',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Vendors ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  language    TEXT NOT NULL DEFAULT 'hi',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Inventory ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id            UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  aliases             TEXT[] DEFAULT '{}',
  stock_qty           NUMERIC NOT NULL DEFAULT 0,
  unit                TEXT NOT NULL DEFAULT 'pcs',
  sale_price          NUMERIC NOT NULL DEFAULT 0,
  cost_price          NUMERIC NOT NULL DEFAULT 0,
  reorder_threshold   NUMERIC NOT NULL DEFAULT 5,
  reorder_qty         NUMERIC NOT NULL DEFAULT 10,
  vendor_id           UUID REFERENCES vendors(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_store ON inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory USING gin(to_tsvector('simple', name));

-- ─── Sales ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sales (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  total_amount     NUMERIC NOT NULL DEFAULT 0,
  payment_method   TEXT NOT NULL DEFAULT 'upi',
  payment_status   TEXT NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Sale Items ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sale_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id     UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  sku_id      UUID NOT NULL REFERENCES inventory(id),
  qty         NUMERIC NOT NULL,
  unit_price  NUMERIC NOT NULL,
  subtotal    NUMERIC NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Reorder Drafts ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reorder_drafts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  sku_id      UUID NOT NULL REFERENCES inventory(id),
  vendor_id   UUID REFERENCES vendors(id),
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'draft',  -- draft | sent | dismissed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Stock Change Log ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS stock_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id      UUID NOT NULL REFERENCES inventory(id),
  sale_id     UUID REFERENCES sales(id),
  change_qty  NUMERIC NOT NULL,   -- negative for sale, positive for restock
  new_qty     NUMERIC NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- RPC Functions
-- ============================================================

-- Atomic stock decrement with negative stock guard
CREATE OR REPLACE FUNCTION decrement_stock(p_sku_id UUID, p_qty NUMERIC)
RETURNS TABLE(new_stock NUMERIC, was_decremented BOOLEAN) AS $$
BEGIN
  UPDATE inventory
  SET stock_qty = stock_qty - p_qty,
      updated_at = now()
  WHERE id = p_sku_id
    AND stock_qty >= p_qty
  RETURNING stock_qty INTO new_stock;

  IF FOUND THEN
    was_decremented := TRUE;
  ELSE
    SELECT stock_qty INTO new_stock FROM inventory WHERE id = p_sku_id;
    was_decremented := FALSE;
  END IF;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Atomic sale commit: insert sale + items + decrement stock in one transaction
CREATE OR REPLACE FUNCTION commit_sale(
  p_store_id UUID,
  p_items JSONB   -- [{"sku_id":"...", "qty":1, "unit_price":45}]
)
RETURNS JSONB AS $$
DECLARE
  v_sale_id UUID;
  v_total NUMERIC := 0;
  v_item JSONB;
  v_new_stock NUMERIC;
  v_was_decremented BOOLEAN;
  v_low_stock_items JSONB := '[]'::JSONB;
  v_inv RECORD;
BEGIN
  -- Calculate total
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_total := v_total + (v_item->>'qty')::NUMERIC * (v_item->>'unit_price')::NUMERIC;
  END LOOP;

  -- Insert sale record
  INSERT INTO sales (store_id, total_amount)
  VALUES (p_store_id, v_total)
  RETURNING id INTO v_sale_id;

  -- Process each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    -- Insert sale item
    INSERT INTO sale_items (sale_id, sku_id, qty, unit_price, subtotal)
    VALUES (
      v_sale_id,
      (v_item->>'sku_id')::UUID,
      (v_item->>'qty')::NUMERIC,
      (v_item->>'unit_price')::NUMERIC,
      (v_item->>'qty')::NUMERIC * (v_item->>'unit_price')::NUMERIC
    );

    -- Decrement stock (with negative guard)
    SELECT ds.new_stock, ds.was_decremented
    INTO v_new_stock, v_was_decremented
    FROM decrement_stock((v_item->>'sku_id')::UUID, (v_item->>'qty')::NUMERIC) ds;

    IF NOT v_was_decremented THEN
      RAISE EXCEPTION 'Insufficient stock for SKU %', v_item->>'sku_id';
    END IF;

    -- Log stock change
    INSERT INTO stock_log (sku_id, sale_id, change_qty, new_qty)
    VALUES ((v_item->>'sku_id')::UUID, v_sale_id, -(v_item->>'qty')::NUMERIC, v_new_stock);

    -- Check if stock fell below reorder threshold
    SELECT name, stock_qty, reorder_threshold, reorder_qty, vendor_id
    INTO v_inv FROM inventory WHERE id = (v_item->>'sku_id')::UUID;

    IF v_inv.stock_qty <= v_inv.reorder_threshold THEN
      v_low_stock_items := v_low_stock_items || jsonb_build_object(
        'sku_id', v_item->>'sku_id',
        'name', v_inv.name,
        'current_qty', v_inv.stock_qty,
        'threshold', v_inv.reorder_threshold,
        'reorder_qty', v_inv.reorder_qty,
        'vendor_id', v_inv.vendor_id
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'sale_id', v_sale_id,
    'total_amount', v_total,
    'low_stock_items', v_low_stock_items
  );
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamp on inventory changes
CREATE OR REPLACE FUNCTION update_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to be idempotent
DROP TRIGGER IF EXISTS trg_inventory_updated_at ON inventory;
CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_timestamp();
