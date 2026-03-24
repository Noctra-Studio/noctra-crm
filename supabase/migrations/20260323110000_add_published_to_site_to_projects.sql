ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS published_to_site boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS projects_published_to_site_idx
ON public.projects (published_to_site)
WHERE published_to_site = true;

UPDATE public.projects
SET published_to_site = CASE
  WHEN COALESCE(slug, '') ILIKE '%dyma%'
    OR COALESCE(slug, '') ILIKE '%woodax%'
    OR COALESCE(name, '') ILIKE '%dyma group%'
    OR COALESCE(name, '') ILIKE '%woodax design%'
  THEN true
  ELSE false
END;
