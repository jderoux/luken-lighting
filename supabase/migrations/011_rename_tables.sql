-- ============================================================
-- Rename: collections -> products
--         products    -> product_variants
--         product_variants -> product_skus
-- ============================================================

-- 1. Rename old product_variants first (avoids name clash)
ALTER TABLE product_variants RENAME TO product_skus;
ALTER TABLE product_skus RENAME COLUMN product_id TO variant_id;

-- 2. Rename products -> product_variants
ALTER TABLE products RENAME TO product_variants;

-- 3. Rename collections -> products
ALTER TABLE collections RENAME TO products;

-- 4. Fix FK columns in product_variants (old collection_id -> product_id)
ALTER TABLE product_variants RENAME COLUMN collection_id TO product_id;

-- 5. Fix FK columns in product_assets and project_products
ALTER TABLE product_assets RENAME COLUMN product_id TO variant_id;
ALTER TABLE project_products RENAME COLUMN product_id TO variant_id;

-- 6. Drop category_id from products (family spans categories)
ALTER TABLE products DROP COLUMN IF EXISTS category_id;
