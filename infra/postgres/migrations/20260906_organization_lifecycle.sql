ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS security_question text,
  ADD COLUMN IF NOT EXISTS security_answer_hash text,
  ADD COLUMN IF NOT EXISTS deletion_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS deletion_scheduled_for timestamptz;

ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_status_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_status_check
  CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING_DELETION', 'DELETED'));

CREATE INDEX IF NOT EXISTS idx_organizations_due_deletion
  ON organizations (deletion_scheduled_for)
  WHERE status = 'PENDING_DELETION' AND deleted_at IS NULL;
