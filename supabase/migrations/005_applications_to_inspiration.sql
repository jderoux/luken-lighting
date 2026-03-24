-- Migration: Rename Applications to Inspiration Projects
-- Restructure as a project showcase with rich metadata

-- 1. Rename tables
ALTER TABLE applications RENAME TO inspiration_projects;
ALTER TABLE product_applications RENAME TO project_products;

-- 2. Rename column in junction table
ALTER TABLE project_products RENAME COLUMN application_id TO project_id;

-- 3. Add project metadata columns to inspiration_projects
ALTER TABLE inspiration_projects ADD COLUMN location TEXT;
ALTER TABLE inspiration_projects ADD COLUMN year INTEGER;
ALTER TABLE inspiration_projects ADD COLUMN architect TEXT;
ALTER TABLE inspiration_projects ADD COLUMN lighting_designer TEXT;
ALTER TABLE inspiration_projects ADD COLUMN client_name TEXT;
ALTER TABLE inspiration_projects ADD COLUMN photographer TEXT;

-- 4. Drop application_type from products
ALTER TABLE products DROP COLUMN IF EXISTS application_type;

-- 5. Rename indexes
ALTER INDEX IF EXISTS idx_product_applications_product RENAME TO idx_project_products_product;
ALTER INDEX IF EXISTS idx_product_applications_application RENAME TO idx_project_products_project;

-- 6. Drop old trigger and create new one
DROP TRIGGER IF EXISTS update_applications_updated_at ON inspiration_projects;
CREATE TRIGGER update_inspiration_projects_updated_at BEFORE UPDATE ON inspiration_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Update RLS policies (drop old, create new with updated names)
-- Drop old policies
DROP POLICY IF EXISTS "Public can view active applications" ON inspiration_projects;
DROP POLICY IF EXISTS "Admin/Editor can insert applications" ON inspiration_projects;
DROP POLICY IF EXISTS "Admin/Editor can update applications" ON inspiration_projects;
DROP POLICY IF EXISTS "Public can view product applications" ON project_products;

-- Create new policies
CREATE POLICY "Public can view inspiration projects"
  ON inspiration_projects FOR SELECT
  USING (true);

CREATE POLICY "Admin/Editor can insert inspiration projects"
  ON inspiration_projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor can update inspiration projects"
  ON inspiration_projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin can delete inspiration projects"
  ON inspiration_projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Public can view project products"
  ON project_products FOR SELECT
  USING (true);

CREATE POLICY "Admin/Editor can insert project products"
  ON project_products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor can delete project products"
  ON project_products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );
