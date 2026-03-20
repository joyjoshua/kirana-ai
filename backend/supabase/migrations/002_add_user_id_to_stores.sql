-- ============================================================
-- KiranaAI — Migration 002: Link auth users to stores
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor after 001_initial_schema.sql
-- ============================================================

ALTER TABLE stores ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);
