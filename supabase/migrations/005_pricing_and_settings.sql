-- Add manufacturer info, cost, and per-product margins to products
ALTER TABLE products ADD COLUMN manufacturer TEXT;
ALTER TABLE products ADD COLUMN manufacturer_sku TEXT;
ALTER TABLE products ADD COLUMN cost_usd NUMERIC(10,2);
ALTER TABLE products ADD COLUMN distributor_margin_pct NUMERIC(10,2);
ALTER TABLE products ADD COLUMN msrp_margin_pct NUMERIC(10,2);

-- App-wide settings (key-value)
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default conversion rate (1 EUR = 1.2 USD)
INSERT INTO app_settings (key, value, description) VALUES
  ('eur_to_usd_rate', '1.2', 'How many USD equal 1 EUR');
