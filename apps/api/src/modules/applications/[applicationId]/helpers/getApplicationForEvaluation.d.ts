import { PoolClient } from "pg";
/**
 * Candidate-side fields relevant to *evaluation*, not the application
 * workflow record. Deliberately excludes: first_name, last_name, email,
 * phone (PII — see toApplicationContextDto for rationale), status,
 * rejection_source/reason/rejected_at (outcome/workflow state, not
 * evaluation input), and every hard-gate-only eligibility field
 * (notice_period_days, willing_to_relocate_for_this_job,
 * requires_visa_sponsorship, work_authorized, current_country/state/city)
 * — those already gated the candidate before this ever runs, so they
 * carry no remaining evaluation signal. resume_object_key/file_name/
 * mime_type/file_size/sha256 are storage plumbing for the separate resume
 * parsing pipeline, not prompt content.
 */
export interface ApplicationForEvaluationRow {
    id: string;
    job_id: string;
    years_of_professional_experience: string;
    highest_education_level: string;
    github_url: string | null;
    portfolio_url: string | null;
    linkedin_url: string | null;
    problem_solving_profile_url: string | null;
    featured_project_name: string | null;
    featured_project_url: string | null;
    project_description: string | null;
    feature_description: string | null;
    engineering_highlight: string | null;
    best_evidence_note: string | null;
    why_you_are_a_good_fit: string | null;
    resume_object_key: string | null;
}
export declare function getApplicationForEvaluation(client: PoolClient, applicationId: string): Promise<ApplicationForEvaluationRow>;
//# sourceMappingURL=getApplicationForEvaluation.d.ts.map