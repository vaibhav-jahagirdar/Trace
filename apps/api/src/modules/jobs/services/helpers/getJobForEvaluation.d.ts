import { PoolClient } from "pg";
export interface JobForEvaluationRow {
    id: string;
    title: string;
    department: string | null;
    description: string;
    role_category_code: string | null;
    role_category_name: string | null;
    role_category_description: string | null;
    experience_min_years: number | null;
    experience_max_years: number | null;
    minimum_education_level: string | null;
    resume_required: boolean | null;
    github_required: boolean | null;
    problem_solving_profile_required: boolean | null;
    linkedin_required: boolean | null;
    project_explanation_required: boolean | null;
    feature_explanation_required: boolean | null;
}
export declare function getJobForEvaluation(client: PoolClient, jobId: string): Promise<JobForEvaluationRow>;
//# sourceMappingURL=getJobForEvaluation.d.ts.map