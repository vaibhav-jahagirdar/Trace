import { JobForEvaluationRow } from "./getJobForEvaluation";
import { JobRequirementRow } from "./getJobRequirement";
import { JobEvaluationPriorityRow } from "./getJobEvaluationPriorities";
import { JobEvidencePriorityRow } from "./getJobEvidencePriorities";
import { JobSuccessSignalRow } from "./getJobSuccessSignals";


export interface RubricItem {
  code: string;
  name: string;
  description: string | null;
  weight: number;
  priority_type: "MANDATORY" | "PREFERRED" | "BONUS";
}

export interface RequirementItem {
  name: string;
  type: "TECHNOLOGY" | "CONCEPT";
  category: string | null;
  weight: number;
}

export interface EvaluationContextDto {
  job: {
    title: string;
    department: string | null;
    description: string;
    roleCategory: {
      code: string;
      name: string;
      description: string | null;
    } | null;
  };
  qualifications: {
    experienceYearsMin: number | null;
    experienceYearsMax: number | null;
    minimumEducationLevel: string | null;
  };
  submissionRequirements: {
    resumeRequired: boolean;
    githubRequired: boolean;
    linkedinRequired: boolean;
    problemSolvingProfileRequired: boolean;
    projectExplanationRequired: boolean;
    featureExplanationRequired: boolean;
  };
  requirements: {
    mandatory: RequirementItem[];
    preferred: RequirementItem[];
    bonus: RequirementItem[];
  };
  evaluationPriorities: RubricItem[];
  evidencePriorities: RubricItem[];
  successSignals: RubricItem[];
}

function toRequirementItem(row: JobRequirementRow): RequirementItem {
  return {
    name: row.name,
    type: row.requirement_type,
    category: row.category,
    weight: Number(row.weight),
  };
}

function groupRequirementsByPriority(
  rows: JobRequirementRow[],
): EvaluationContextDto["requirements"] {
  const buckets: Record<"MANDATORY" | "PREFERRED" | "BONUS", JobRequirementRow[]> = {
    MANDATORY: [],
    PREFERRED: [],
    BONUS: [],
  };

  for (const row of rows) {
    buckets[row.priority_type].push(row);
  }

  return {
    mandatory: buckets.MANDATORY.map(toRequirementItem),
    preferred: buckets.PREFERRED.map(toRequirementItem),
    bonus: buckets.BONUS.map(toRequirementItem),
  };
}

function toRubricItem(row: {
  code: string;
  name: string;
  description: string | null;
  weight: number;
  priority_type?: string 
}): RubricItem {
  return {
    code: row.code,
    name: row.name,
    description: row.description,
    weight: row.weight,
    priority_type: row.priority_type as "MANDATORY" | "PREFERRED" | "BONUS"
  };
}

export function toEvaluationContextDto(
  job: JobForEvaluationRow,
  requirements: JobRequirementRow[],
  evaluationPriorities: JobEvaluationPriorityRow[],
  evidencePriorities: JobEvidencePriorityRow[],
  successSignals: JobSuccessSignalRow[],
): EvaluationContextDto {
  return {
    job: {
      title: job.title,
      department: job.department,
      description: job.description,
      roleCategory: job.role_category_code
        ? {
            code: job.role_category_code,
            name: job.role_category_name as string,
            description: job.role_category_description,
          }
        : null,
    },
    qualifications: {
      experienceYearsMin: job.experience_min_years,
      experienceYearsMax: job.experience_max_years,
      minimumEducationLevel: job.minimum_education_level,
    },
    submissionRequirements: {
      resumeRequired: job.resume_required ?? false,
      githubRequired: job.github_required ?? false,
      linkedinRequired: job.linkedin_required ?? false,
      problemSolvingProfileRequired: job.problem_solving_profile_required ?? false,
      projectExplanationRequired: job.project_explanation_required ?? false,
      featureExplanationRequired: job.feature_explanation_required ?? false,
    },
    requirements: groupRequirementsByPriority(requirements),
    evaluationPriorities: evaluationPriorities.map(toRubricItem),
    evidencePriorities: evidencePriorities.map(toRubricItem),
    successSignals: successSignals.map(toRubricItem),
  };
}