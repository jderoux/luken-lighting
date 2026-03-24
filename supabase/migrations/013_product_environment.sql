-- Add indoor/outdoor scope to product families and variants.
-- Variants inherit scope from their assigned product family.

ALTER TABLE products
ADD COLUMN environment TEXT CHECK (environment IN ('indoor', 'outdoor'));

ALTER TABLE product_variants
ADD COLUMN environment TEXT CHECK (environment IN ('indoor', 'outdoor'));

-- Backfill variants from product family when linked.
UPDATE product_variants pv
SET environment = p.environment
FROM products p
WHERE pv.product_id = p.id;

-- Keep variant environment in sync when product family changes.
UPDATE product_variants pv
SET environment = p.environment
FROM products p
WHERE pv.product_id = p.id
  AND pv.environment IS DISTINCT FROM p.environment;

CREATE OR REPLACE FUNCTION sync_variant_environment_from_product()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    SELECT environment INTO NEW.environment
    FROM products
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_variant_environment_from_product_trigger ON product_variants;
CREATE TRIGGER sync_variant_environment_from_product_trigger
BEFORE INSERT OR UPDATE OF product_id, environment ON product_variants
FOR EACH ROW
EXECUTE FUNCTION sync_variant_environment_from_product();

CREATE OR REPLACE FUNCTION propagate_product_environment_to_variants()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_variants
  SET environment = NEW.environment
  WHERE product_id = NEW.id
    AND environment IS DISTINCT FROM NEW.environment;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS propagate_product_environment_to_variants_trigger ON products;
CREATE TRIGGER propagate_product_environment_to_variants_trigger
AFTER UPDATE OF environment ON products
FOR EACH ROW
EXECUTE FUNCTION propagate_product_environment_to_variants();
