WITH dyma_update AS (
  UPDATE public.projects
  SET
    status = 'design',
    updated_at = timezone('utc'::text, now())
  WHERE (
    COALESCE(slug, '') = 'dyma-group'
    OR LOWER(COALESCE(name, '')) = 'dyma group'
  )
    AND status IS DISTINCT FROM 'design'
  RETURNING id
),
woodax_update AS (
  UPDATE public.projects
  SET
    status = 'discovery',
    updated_at = timezone('utc'::text, now())
  WHERE (
    COALESCE(slug, '') = 'woodax-design'
    OR LOWER(COALESCE(name, '')) = 'woodax design'
  )
    AND status IS DISTINCT FROM 'discovery'
  RETURNING id
)
INSERT INTO public.project_status_history (project_id, status)
SELECT id, 'design' FROM dyma_update
UNION ALL
SELECT id, 'discovery' FROM woodax_update;
