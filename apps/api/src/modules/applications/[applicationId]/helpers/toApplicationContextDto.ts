import { ApplicationForEvaluationRow } from "./getApplicationForEvaluation";
import { ApplicationTechnologyRow } from "./getApplicationTechnologies";
import { ApplicationConceptRow } from "./getApplicationConcepts";

export interface TaggedItem {
  name: string;
  category: string | null;
}

export interface ApplicationContextDto {
  candidateProfile: {
    yearsOfProfessionalExperience: number;
    highestEducationLevel: string;
  };
  submittedEvidence: {
    resumeProvided: boolean;
    githubUrl: string | null;
    portfolioUrl: string | null;
    linkedinUrl: string | null;
    problemSolvingProfileUrl: string | null;
    featuredProjectName: string | null;
    featuredProjectUrl: string | null;
    projectDescription: string | null;
    featureDescription: string | null;
    engineeringHighlight: string | null;
    bestEvidenceNote: string | null;
    whyGoodFit: string | null;
  };
  claimedTechnologies: TaggedItem[];
  claimedConcepts: TaggedItem[];
}

export function toApplicationContextDto(
  application: ApplicationForEvaluationRow,
  technologies: ApplicationTechnologyRow[],
  concepts: ApplicationConceptRow[],
): ApplicationContextDto {
  return {
    candidateProfile: {
      yearsOfProfessionalExperience: Number(application.years_of_professional_experience),
      highestEducationLevel: application.highest_education_level,
    },
    submittedEvidence: {
      resumeProvided: application.resume_object_key !== null,
      githubUrl: application.github_url,
      portfolioUrl: application.portfolio_url,
      linkedinUrl: application.linkedin_url,
      problemSolvingProfileUrl: application.problem_solving_profile_url,
      featuredProjectName: application.featured_project_name,
      featuredProjectUrl: application.featured_project_url,
      projectDescription: application.project_description,
      featureDescription: application.feature_description,
      engineeringHighlight: application.engineering_highlight,
      bestEvidenceNote: application.best_evidence_note,
      whyGoodFit: application.why_you_are_a_good_fit,
    },
    claimedTechnologies: technologies,
    claimedConcepts: concepts,
  };
}