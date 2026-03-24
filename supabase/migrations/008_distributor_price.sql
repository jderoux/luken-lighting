-- Replace margin columns with a single distributor_price column
-- MSRP is always 2x distributor_price (distributor keeps 50% margin)

ALTER TABLE products ADD COLUMN distributor_price NUMERIC(10,2);

-- Migrate existing data: calculate distributor_price from cost + margin
UPDATE products
SET distributor_price = ROUND(cost_usd / (1 - distributor_margin_pct / 100), 2)
WHERE cost_usd IS NOT NULL
  AND distributor_margin_pct IS NOT NULL
  AND distributor_margin_pct < 100;

ALTER TABLE products DROP COLUMN distributor_margin_pct;
ALTER TABLE products DROP COLUMN msrp_margin_pct;
