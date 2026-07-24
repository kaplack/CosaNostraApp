ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS public_name TEXT,
  ADD COLUMN IF NOT EXISTS creator_slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS users_creator_slug_unique
  ON public.users (creator_slug)
  WHERE creator_slug IS NOT NULL;

ALTER TABLE public.saved_custom_pizzas
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS saved_custom_pizzas_slug_unique
  ON public.saved_custom_pizzas (slug)
  WHERE slug IS NOT NULL;
