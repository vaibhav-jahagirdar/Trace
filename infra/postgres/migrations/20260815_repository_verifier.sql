CREATE TABLE IF NOT EXISTS application_repository_verifier_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_repository_analysis_id uuid NOT NULL
    REFERENCES application_repository_analyses(id),
  attempt integer NOT NULL DEFAULT 1,
  status text NOT NULL CHECK (status IN (
    'PENDING', 'RETRIEVING', 'FILES_RETRIEVED', 'LLM_COMPLETED',
    'COMPLETED', 'FAILED', 'QUARANTINED'
  )),
  verifier_model text,
  verifier_prompt_version text,
  raw_llm_response text,
  cleaned_report jsonb,
  retrieval_manifest jsonb,
  evidence_snapshot jsonb,
  verifier_input_hash text,
  verifier_report_hash text,
  repository_snapshot_manifest_hash text,
  stage1_report_hash text,
  stage2a_report_hash text,
  error_message text,
  started_at timestamptz,
  retrieval_completed_at timestamptz,
  llm_completed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_repository_verifier_runs_analysis
  ON application_repository_verifier_runs
  (application_repository_analysis_id, created_at DESC);

CREATE TABLE IF NOT EXISTS application_repository_evidence_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verifier_run_id uuid NOT NULL
    REFERENCES application_repository_verifier_runs(id) ON DELETE CASCADE,
  evidence_id text NOT NULL,
  repository_id text NOT NULL,
  snapshot_ref text NOT NULL,
  blob_sha text,
  path text NOT NULL,
  artifact_type text NOT NULL,
  start_line integer NOT NULL CHECK (start_line >= 1),
  end_line integer NOT NULL CHECK (end_line >= start_line),
  content text,
  content_hash text NOT NULL,
  retrieval_status text NOT NULL CHECK (retrieval_status IN (
    'RETRIEVED', 'UNAVAILABLE', 'FAILED', 'BINARY'
  )),
  retrieval_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (verifier_run_id, evidence_id)
);

CREATE INDEX IF NOT EXISTS idx_repository_evidence_units_run
  ON application_repository_evidence_units(verifier_run_id);

CREATE TABLE IF NOT EXISTS application_repository_score_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verifier_run_id uuid NOT NULL
    REFERENCES application_repository_verifier_runs(id),
  application_repository_analysis_id uuid NOT NULL
    REFERENCES application_repository_analyses(id),
  policy_version text NOT NULL,
  policy_snapshot jsonb NOT NULL,
  scorer_source_revision text NOT NULL,
  stage1_score numeric(8,4) NOT NULL,
  repository_evidence_score numeric(8,4) NOT NULL,
  repository_coverage_score numeric(8,4) NOT NULL,
  repository_adjustment numeric(8,4) NOT NULL,
  combined_score numeric(8,4) NOT NULL,
  assessed_requirement_weight numeric(10,4) NOT NULL,
  total_requirement_weight numeric(10,4) NOT NULL,
  mandatory_complete_negative_count integer NOT NULL DEFAULT 0,
  direct_claim_contradiction_count integer NOT NULL DEFAULT 0,
  observed_material_risk_count integer NOT NULL DEFAULT 0,
  requirement_contributions jsonb NOT NULL,
  audit_notes jsonb NOT NULL,
  scoring_mode text NOT NULL CHECK (scoring_mode IN ('SHADOW', 'ACTIVE')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_repository_score_runs_analysis
  ON application_repository_score_runs
  (application_repository_analysis_id, created_at DESC);

CREATE TABLE IF NOT EXISTS repository_shortlist_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id),
  policy_version text NOT NULL,
  scoring_mode text NOT NULL CHECK (scoring_mode IN ('SHADOW', 'ACTIVE')),
  candidate_cohort_type text NOT NULL,
  cohort_size integer NOT NULL CHECK (cohort_size >= 0),
  target_count integer NOT NULL CHECK (target_count >= 0),
  final_interview_rate numeric(6,4) NOT NULL,
  cohort_hash text NOT NULL,
  cutoff_score numeric(8,4),
  cutoff_tie_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_repository_shortlist_runs_job_cohort
  ON repository_shortlist_runs(job_id, cohort_hash);

CREATE TABLE IF NOT EXISTS repository_shortlist_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shortlist_run_id uuid NOT NULL REFERENCES repository_shortlist_runs(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES job_applications(id),
  score_run_id uuid NOT NULL REFERENCES application_repository_score_runs(id),
  rank integer,
  combined_score numeric(8,4) NOT NULL,
  repository_adjustment numeric(8,4) NOT NULL,
  disposition text NOT NULL CHECK (disposition IN (
    'AUTOMATICALLY_RECOMMENDED',
    'EVIDENCE_EQUIVALENT_AT_CUTOFF',
    'NOT_AUTOMATICALLY_RECOMMENDED',
    'QUARANTINED',
    'INELIGIBLE'
  )),
  tie_group_id text,
  decision_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (shortlist_run_id, application_id)
);

CREATE INDEX IF NOT EXISTS idx_repository_shortlist_members_run_rank
  ON repository_shortlist_members(shortlist_run_id, rank);
