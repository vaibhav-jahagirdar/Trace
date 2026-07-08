export function toGetJobDto(row: any) {
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    employement_type: row.employement_type,
    work_mode: row.work_mode,
    country: row.country,
    state: row.state,
    city: row.city,
    organization_id: row.organization_id,
    open_positions: row.open_positions,
    description: row.description,
    published_at: row.published_at,

    eligibility: {
      currency: row.currency,
      salary_min: row.salary_min,
      salary_max: row.salary_max,
      experience_min_years: row.experience_min_years,
      experience_max_years: row.experience_max_years,
      notice_period_max_days: row.notice_period_max_days,
      relocation_supported: row.relocation_supported,
      visa_sponsorship: row.visa_sponsorship,
      work_authorization_required: row.work_authorization_required,
      minimum_education_level: row.minimum_education_level,
    },

    submission_requirements: {
      resume_required: row.resume_required,
      github_required: row.github_required,
      problem_solving_profile_required:
        row.problem_solving_profile_required,
      linkedin_required: row.linkedin_required,
      project_explanation_required:
        row.project_explanation_required,
      feature_explanation_required:
        row.feature_explanation_required,
    },
  };
}