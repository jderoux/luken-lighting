-- Add thumbnail images for collections and applications
-- Thumbnails are used on listing/grid pages; hero images are used on detail page banners.

ALTER TABLE collections ADD COLUMN thumbnail_url TEXT;
ALTER TABLE applications ADD COLUMN thumbnail_url TEXT;
