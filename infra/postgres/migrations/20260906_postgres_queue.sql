ALTER TABLE application_tasks
  ADD COLUMN IF NOT EXISTS queue_name text,
  ADD COLUMN IF NOT EXISTS available_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS locked_by text,
  ADD COLUMN IF NOT EXISTS locked_at timestamptz,
  ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_heartbeat_at timestamptz;

UPDATE application_tasks
SET queue_name = CASE task_type
  WHEN 'RESUME_PARSE' THEN 'resume-analysis'
  WHEN 'REPOSITORY_PLAN' THEN 'repo planner'
  WHEN 'REPOSITORY_VERIFY' THEN 'repo verifier'
  ELSE queue_name
END
WHERE queue_name IS NULL;

UPDATE application_tasks
SET available_at = COALESCE(next_retry_at, available_at, now())
WHERE status = 'PENDING';

UPDATE application_tasks
SET status = CASE WHEN attempt_count >= max_attempts THEN 'FAILED' ELSE 'PENDING' END,
    human_intervention_required = CASE WHEN attempt_count >= max_attempts THEN TRUE ELSE human_intervention_required END,
    locked_by = NULL, locked_at = NULL, lease_expires_at = NULL,
    last_heartbeat_at = NULL, updated_at = NOW()
WHERE lease_expires_at IS NOT NULL AND lease_expires_at < NOW();

CREATE INDEX IF NOT EXISTS idx_application_tasks_queue_claim
  ON application_tasks (queue_name, available_at, created_at)
  WHERE status = 'PENDING' AND human_intervention_required = FALSE;

CREATE INDEX IF NOT EXISTS idx_application_tasks_lease_expiry
  ON application_tasks (lease_expires_at)
  WHERE lease_expires_at IS NOT NULL;
