-- Migration: Replace boolean dimmable with control_types array

ALTER TABLE products ADD COLUMN control_types TEXT[] DEFAULT '{}';

-- Migrate existing data: if dimmable was true, set a default control type
UPDATE products SET control_types = ARRAY['phase'] WHERE dimmable = true;
UPDATE products SET control_types = ARRAY['on-off'] WHERE dimmable = false;

ALTER TABLE products DROP COLUMN dimmable;
