-- Add sort_order to collections for drag-and-drop reordering
ALTER TABLE collections ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Set initial order alphabetically
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS rn
  FROM collections
)
UPDATE collections SET sort_order = numbered.rn
FROM numbered WHERE collections.id = numbered.id;
