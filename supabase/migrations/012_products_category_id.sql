-- Add category_id to products (family) so each family has one category; variants inherit it.
ALTER TABLE products ADD COLUMN category_id UUID REFERENCES product_categories(id);

-- Backfill: set each product's category to the most common category among its variants
UPDATE products SET category_id = sub.cat_id
FROM (
  SELECT product_id, category_id AS cat_id,
         ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY COUNT(*) DESC) AS rn
  FROM product_variants
  WHERE product_id IS NOT NULL
  GROUP BY product_id, category_id
) sub
WHERE products.id = sub.product_id AND sub.rn = 1;
