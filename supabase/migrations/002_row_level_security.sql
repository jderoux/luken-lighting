-- Row Level Security Policies
-- This ensures data security at the database level

-- Helper function to check user role without triggering RLS recursion on user_profiles
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for active content (no auth required)
-- This allows the public website to display products

CREATE POLICY "Public can view active categories"
  ON product_categories FOR SELECT
  USING (true);

CREATE POLICY "Public can view active applications"
  ON applications FOR SELECT
  USING (true);

CREATE POLICY "Public can view active collections"
  ON collections FOR SELECT
  USING (true);

CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view product applications"
  ON product_applications FOR SELECT
  USING (true);

CREATE POLICY "Public can view active variants"
  ON product_variants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view product assets"
  ON product_assets FOR SELECT
  USING (true);

-- Admin/Editor write access
-- Only authenticated users with admin or editor role can modify data

CREATE POLICY "Admin/Editor can insert categories"
  ON product_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor can update categories"
  ON product_categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin can delete categories"
  ON product_categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Repeat for other tables
CREATE POLICY "Admin/Editor can insert applications"
  ON applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor can update applications"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor can insert collections"
  ON collections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor can update collections"
  ON collections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor can view all products"
  ON products FOR SELECT
  USING (
    is_active = true OR
    public.get_user_role() IN ('admin', 'editor', 'viewer')
  );

CREATE POLICY "Admin/Editor can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Variants policies
CREATE POLICY "Admin/Editor can insert variants"
  ON product_variants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor can update variants"
  ON product_variants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- Assets policies
CREATE POLICY "Admin/Editor can insert assets"
  ON product_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor can update assets"
  ON product_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor can delete assets"
  ON product_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- User profiles policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON user_profiles FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

