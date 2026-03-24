-- Add category_id to collections so each collection belongs to one category
ALTER TABLE collections ADD COLUMN category_id UUID REFERENCES product_categories(id);

-- Backfill: set each collection's category to the most common category among its products
UPDATE collections SET category_id = sub.cat_id
FROM (
  SELECT collection_id, category_id AS cat_id,
         ROW_NUMBER() OVER (PARTITION BY collection_id ORDER BY COUNT(*) DESC) AS rn
  FROM products WHERE collection_id IS NOT NULL
  GROUP BY collection_id, category_id
) sub
WHERE collections.id = sub.collection_id AND sub.rn = 1;
