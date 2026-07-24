ALTER TABLE ingredients
  ADD COLUMN IF NOT EXISTS selector_image_url TEXT,
  ADD COLUMN IF NOT EXISTS selector_image_key TEXT;
