ALTER TABLE jobs ADD COLUMN IF NOT EXISTS slug text;

WITH normalized AS (
  SELECT id, organization_id,
         COALESCE(NULLIF(regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'), ''), 'job') AS base_slug,
         ROW_NUMBER() OVER (
           PARTITION BY organization_id, COALESCE(NULLIF(regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'), ''), 'job')
           ORDER BY created_at, id
         ) AS duplicate_number
  FROM jobs
  WHERE slug IS NULL
)
UPDATE jobs j
SET slug = LEFT(n.base_slug, 180) || CASE WHEN n.duplicate_number = 1 THEN '' ELSE '-' || n.duplicate_number::text END
FROM normalized n
WHERE j.id = n.id;

ALTER TABLE jobs ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_organization_slug ON jobs (organization_id, slug);
