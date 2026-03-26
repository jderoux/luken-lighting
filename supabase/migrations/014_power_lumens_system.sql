-- Add system-level power and lumens columns to product_variants
-- power_w / lumens remain as source values; new columns store system values.
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS power_w_system numeric,
  ADD COLUMN IF NOT EXISTS lumens_system  numeric;
