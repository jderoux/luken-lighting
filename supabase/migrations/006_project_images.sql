-- Migration: Add project_images table for inspiration project photo galleries

CREATE TABLE project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES inspiration_projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_project_images_project ON project_images(project_id);

CREATE TRIGGER update_project_images_updated_at BEFORE UPDATE ON project_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view project images"
  ON project_images FOR SELECT
  USING (true);

CREATE POLICY "Admin/Editor can insert project images"
  ON project_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor can update project images"
  ON project_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor can delete project images"
  ON project_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );
