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
export declare function toApplicationContextDto(application: ApplicationForEvaluationRow, technologies: ApplicationTechnologyRow[], concepts: ApplicationConceptRow[]): ApplicationContextDto;
//# sourceMappingURL=toApplicationContextDto.d.ts.map