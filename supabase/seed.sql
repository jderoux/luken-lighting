-- Seed Data for Luken Lighting
-- This provides sample data to populate the database for testing

-- Insert Product Categories
INSERT INTO product_categories (slug, name, description, sort_order) VALUES
  ('downlights', 'Downlights', 'Recessed ceiling lights for ambient and accent lighting', 1),
  ('wall-lights', 'Wall Lights', 'Minimal wall-mounted fixtures for architectural accent lighting', 2),
  ('ceiling-lights', 'Ceiling Lights', 'Surface-mounted ceiling fixtures and plafones', 3),
  ('pendant-lights', 'Pendant Lights', 'Suspended architectural lighting solutions', 4),
  ('outdoor-lights', 'Outdoor Lights', 'Weather-resistant exterior lighting', 5),
  ('bathroom-lights', 'Bathroom Lights', 'IP-rated fixtures for wet locations', 6);

-- Insert Inspiration Projects
INSERT INTO inspiration_projects (slug, name, description, sort_order, location, year, architect, lighting_designer, client_name, photographer) VALUES
  ('casa-serena', 'Casa Serena', 'A minimalist residential project where light defines every space without a single fixture drawing attention. Recessed downlights and concealed linear profiles create a warm, layered atmosphere throughout.', 1, 'Madrid, Spain', 2024, 'Estudio Balcells', 'Luken Lighting Studio', 'Private Client', 'Adrià Goula'),
  ('hotel-marea', 'Hotel Marea', 'A boutique coastal hotel where the architecture takes center stage. Our invisible lighting solutions highlight textured walls, vaulted ceilings, and open corridors without competing with the design.', 2, 'Tulum, Mexico', 2023, 'CO-LAB Design Office', 'Luken Lighting Studio', 'Hotel Marea Group', 'César Béjar'),
  ('torre-norte-offices', 'Torre Norte Offices', 'A modern office tower featuring integrated ceiling lighting systems that provide uniform, glare-free illumination across open workspaces and private meeting rooms.', 3, 'Panama City, Panama', 2024, 'Mallol & Mallol Arquitectos', NULL, 'Torre Norte S.A.', 'Fernando Alda');

-- Insert Collections
INSERT INTO collections (slug, name, description) VALUES
  ('lux-series', 'Lux Series', 'Our premium collection featuring the finest materials and cutting-edge LED technology'),
  ('minimalist', 'Minimalist Collection', 'Clean lines and understated elegance for modern interiors'),
  ('heritage', 'Heritage Collection', 'Timeless designs inspired by classic architectural lighting');

-- Insert Sample Products
INSERT INTO products (
  slug, name, code, short_description, long_description,
  category_id, collection_id,
  mounting_type, ip_rating, light_source,
  power_w, lumens, efficacy_lm_per_w, cct_min, cct_max, cri,
  control_types, voltage, class, material, finish,
  dimensions, is_active, is_featured
) VALUES
  (
    'aria-downlight-fixed',
    'Aria Downlight Fixed',
    'AR-DL-FX-001',
    'Elegant fixed downlight with superior beam control',
    'The Aria Fixed Downlight combines minimalist aesthetics with exceptional performance. Features a recessed trim design that seamlessly integrates into any ceiling, providing uniform illumination with minimal glare. Perfect for residential and commercial applications.',
    (SELECT id FROM product_categories WHERE slug = 'downlights'),
    (SELECT id FROM collections WHERE slug = 'lux-series'),
    'recessed', 'IP20', 'LED Integrated',
    8, 720, 90, 2700, 3000, 90,
    ARRAY['phase', 'dali', '0-10v'], '220-240V', 'Class II', 'Aluminum', 'White',
    '{"diameter_mm": 90, "cutout_mm": 75, "depth_mm": 95}'::jsonb,
    true, true
  ),
  (
    'nova-wall-sconce',
    'Nova Wall Sconce',
    'NV-WL-SC-002',
    'Contemporary wall light with adjustable beam angle',
    'Nova Wall Sconce features a sleek cylindrical design with up/down light distribution. The adjustable beam angle allows for customized lighting effects, making it ideal for accent lighting in corridors, living spaces, and hospitality environments.',
    (SELECT id FROM product_categories WHERE slug = 'wall-lights'),
    (SELECT id FROM collections WHERE slug = 'minimalist'),
    'wall', 'IP20', 'LED Integrated',
    6, 540, 90, 3000, 3000, 90,
    ARRAY['phase', 'casambi'], '220-240V', 'Class II', 'Aluminum', 'Black',
    '{"height_mm": 150, "width_mm": 60, "depth_mm": 90}'::jsonb,
    true, true
  ),
  (
    'zenith-pendant-round',
    'Zenith Pendant Round',
    'ZN-PD-RD-003',
    'Architectural pendant with diffused lighting',
    'The Zenith Round Pendant offers sophisticated ambient lighting through its precision-engineered diffuser. Available in multiple sizes, this fixture provides glare-free illumination perfect for dining areas, lobbies, and open-plan spaces.',
    (SELECT id FROM product_categories WHERE slug = 'pendant-lights'),
    (SELECT id FROM collections WHERE slug = 'lux-series'),
    'pendant', 'IP20', 'LED Integrated',
    18, 1620, 90, 3000, 4000, 90,
    ARRAY['dali', '1-10v', 'push'], '220-240V', 'Class I', 'Aluminum', 'Brushed Brass',
    '{"diameter_mm": 300, "height_mm": 120}'::jsonb,
    true, false
  ),
  (
    'terra-outdoor-wall',
    'Terra Outdoor Wall Light',
    'TR-OD-WL-004',
    'Weather-resistant exterior wall fixture',
    'Terra Outdoor Wall Light is engineered for durability and performance in exterior environments. With IP65 rating and marine-grade finishes, it delivers reliable illumination for facades, entrances, and outdoor pathways.',
    (SELECT id FROM product_categories WHERE slug = 'outdoor-lights'),
    (SELECT id FROM collections WHERE slug = 'heritage'),
    'wall', 'IP65', 'LED Integrated',
    12, 960, 80, 3000, 3000, 80,
    ARRAY['on-off'], '220-240V', 'Class I', 'Aluminum', 'Anthracite',
    '{"height_mm": 200, "width_mm": 120, "depth_mm": 110}'::jsonb,
    true, false
  ),
  (
    'aqua-bathroom-downlight',
    'Aqua Bathroom Downlight',
    'AQ-BT-DL-005',
    'IP65 rated downlight for wet locations',
    'Specially designed for bathroom and wet room installations, the Aqua Downlight features a sealed construction with IP65 rating. The integrated LED provides excellent color rendering while maintaining safety in humid environments.',
    (SELECT id FROM product_categories WHERE slug = 'bathroom-lights'),
    (SELECT id FROM collections WHERE slug = 'minimalist'),
    'recessed', 'IP65', 'LED Integrated',
    7, 630, 90, 4000, 4000, 90,
    ARRAY['phase', 'dali'], '220-240V', 'Class II', 'Aluminum', 'Chrome',
    '{"diameter_mm": 85, "cutout_mm": 68, "depth_mm": 85}'::jsonb,
    true, false
  ),
  (
    'solaris-ceiling-flush',
    'Solaris Ceiling Flush Mount',
    'SL-CL-FM-006',
    'Low-profile ceiling light with wide distribution',
    'The Solaris Flush Mount provides generous illumination in spaces with limited ceiling height. Its wide beam angle and high lumen output make it perfect for hallways, closets, and utility areas.',
    (SELECT id FROM product_categories WHERE slug = 'ceiling-lights'),
    (SELECT id FROM collections WHERE slug = 'minimalist'),
    'surface', 'IP20', 'LED Integrated',
    15, 1350, 90, 3000, 3000, 90,
    ARRAY['phase', '0-10v', 'casambi'], '220-240V', 'Class II', 'Acrylic', 'White',
    '{"diameter_mm": 250, "height_mm": 45}'::jsonb,
    true, false
  );

-- Link products to inspiration projects
INSERT INTO project_products (product_id, project_id)
SELECT 
  p.id,
  ip.id
FROM products p
CROSS JOIN inspiration_projects ip
WHERE 
  (p.slug = 'aria-downlight-fixed' AND ip.slug IN ('casa-serena', 'torre-norte-offices'))
  OR (p.slug = 'nova-wall-sconce' AND ip.slug IN ('casa-serena', 'hotel-marea'))
  OR (p.slug = 'zenith-pendant-round' AND ip.slug IN ('hotel-marea'))
  OR (p.slug = 'terra-outdoor-wall' AND ip.slug IN ('hotel-marea'))
  OR (p.slug = 'aqua-bathroom-downlight' AND ip.slug IN ('casa-serena'))
  OR (p.slug = 'solaris-ceiling-flush' AND ip.slug IN ('torre-norte-offices'));

-- Insert Product Variants (different finishes/color temps)
INSERT INTO product_variants (product_id, code, name, finish, cct, lumens, sort_order)
SELECT 
  p.id,
  'AR-DL-FX-001-WH-2700',
  'White / 2700K',
  'White',
  2700,
  720,
  1
FROM products p WHERE p.slug = 'aria-downlight-fixed'
UNION ALL
SELECT 
  p.id,
  'AR-DL-FX-001-WH-3000',
  'White / 3000K',
  'White',
  3000,
  720,
  2
FROM products p WHERE p.slug = 'aria-downlight-fixed'
UNION ALL
SELECT 
  p.id,
  'AR-DL-FX-001-BK-2700',
  'Black / 2700K',
  'Black',
  2700,
  720,
  3
FROM products p WHERE p.slug = 'aria-downlight-fixed';

-- Insert sample product assets (you'll need to upload actual files to Supabase Storage)
INSERT INTO product_assets (product_id, type, title, file_url, file_extension, sort_order)
SELECT 
  p.id,
  'image',
  'Main Product Image',
  '/images/products/aria-downlight-main.jpg',
  'jpg',
  1
FROM products p WHERE p.slug = 'aria-downlight-fixed'
UNION ALL
SELECT 
  p.id,
  'datasheet',
  'Technical Datasheet',
  '/documents/aria-downlight-datasheet.pdf',
  'pdf',
  1
FROM products p WHERE p.slug = 'aria-downlight-fixed'
UNION ALL
SELECT 
  p.id,
  'photometric',
  'IES Photometric File',
  '/documents/aria-downlight.ies',
  'ies',
  1
FROM products p WHERE p.slug = 'aria-downlight-fixed';

-- Insert a default price list
INSERT INTO price_lists (name, currency, description, is_default) VALUES
  ('Standard Price List USD', 'USD', 'Default pricing in US Dollars', true);

-- Insert sample prices
INSERT INTO product_prices (product_id, price_list_id, price)
SELECT 
  p.id,
  pl.id,
  CASE 
    WHEN p.slug = 'aria-downlight-fixed' THEN 85.00
    WHEN p.slug = 'nova-wall-sconce' THEN 125.00
    WHEN p.slug = 'zenith-pendant-round' THEN 245.00
    WHEN p.slug = 'terra-outdoor-wall' THEN 165.00
    WHEN p.slug = 'aqua-bathroom-downlight' THEN 95.00
    WHEN p.slug = 'solaris-ceiling-flush' THEN 75.00
  END
FROM products p
CROSS JOIN price_lists pl
WHERE pl.is_default = true;

-- Note: After running this seed data, you should:
-- 1. Create a user in Supabase Auth
-- 2. Add their profile to user_profiles table:
--    INSERT INTO user_profiles (id, full_name, role) 
--    VALUES ('[user-uuid-from-auth]', 'Admin User', 'admin');

