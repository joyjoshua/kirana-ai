-- ============================================================
-- KiranaAI — Seed Data (Demo Store + Vendor + 10 Inventory Items)
-- ============================================================
-- Safe to re-run: uses ON CONFLICT DO NOTHING.
-- ============================================================

-- Demo store: Ramesh Bhai's kirana store in Jayanagar
INSERT INTO stores (id, owner_name, store_name, phone, upi_vpa, preferred_language)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Ramesh Bhai',
  'Ramesh General Store',
  '+919876543210',
  'rameshstore@upi',
  'hi'
)
ON CONFLICT (id) DO NOTHING;

-- Demo vendor: Suresh Bhai (supplier)
INSERT INTO vendors (id, store_id, name, phone, language)
VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Suresh Bhai',
  '+919876543211',
  'hi'
)
ON CONFLICT (id) DO NOTHING;

-- 10 common kirana inventory items with realistic pricing
INSERT INTO inventory (store_id, name, aliases, stock_qty, unit, sale_price, cost_price, reorder_threshold, reorder_qty, vendor_id) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Atta 1kg',       '{"wheat flour","aata","gehun ka atta"}',    5,  'kg',     45,  38,  10, 20, 'b1000000-0000-0000-0000-000000000001'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Parle-G',        '{"biscuit","parle","parle g"}',             30, 'packet', 10,  8,   10, 50, 'b1000000-0000-0000-0000-000000000001'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Maggi',          '{"noodles","maggi noodles","magi"}',        25, 'packet', 14,  12,  10, 50, 'b1000000-0000-0000-0000-000000000001'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Sugar 1kg',      '{"cheeni","sugar","shakkar"}',              15, 'kg',     48,  42,  10, 25, 'b1000000-0000-0000-0000-000000000001'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Rice 1kg',       '{"chawal","basmati","rice"}',               20, 'kg',     65,  55,  10, 25, 'b1000000-0000-0000-0000-000000000001'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Toor Dal 1kg',   '{"arhar dal","dal","toor"}',                12, 'kg',     140, 120, 5,  15, 'b1000000-0000-0000-0000-000000000001'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Amul Butter',    '{"butter","makhan","amul"}',                8,  'pcs',    56,  48,  5,  20, 'b1000000-0000-0000-0000-000000000001'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Surf Excel 1kg', '{"detergent","surf","washing powder"}',     6,  'packet', 120, 100, 3,  10, 'b1000000-0000-0000-0000-000000000001'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Milk 500ml',     '{"doodh","milk","amul milk"}',              20, 'packet', 28,  25,  15, 40, 'b1000000-0000-0000-0000-000000000001'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Maida 1kg',      '{"refined flour","maida","all purpose"}',   8,  'kg',     42,  35,  5,  15, 'b1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
