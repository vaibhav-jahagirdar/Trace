export declare function getJob(jobId: string): Promise<{
    id: any;
    title: any;
    department: any;
    employement_type: any;
    work_mode: any;
    remote_scope: any;
    country: any;
    state: any;
    city: any;
    organization_id: any;
    open_positions: any;
    description: any;
    published_at: any;
    eligibility: {
        currency: any;
        salary_min: any;
        salary_max: any;
        experience_min_years: any;
        experience_max_years: any;
        notice_period_max_days: any;
        relocation_assistance: any;
        visa_sponsorship: any;
        work_authorization_required: any;
        minimum_education_level: any;
    };
    submission_requirements: {
        resume_required: any;
        github_required: any;
        problem_solving_profile_required: any;
        linkedin_required: any;
        project_explanation_required: any;
        feature_explanation_required: any;
    };
}>;
//# sourceMappingURL=job.get.service.d.ts.map