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
export declare function toEvaluationContextDto(job: JobForEvaluationRow, requirements: JobRequirementRow[], evaluationPriorities: JobEvaluationPriorityRow[], evidencePriorities: JobEvidencePriorityRow[], successSignals: JobSuccessSignalRow[]): EvaluationContextDto;
//# sourceMappingURL=toEvaluationContextDto.d.ts.map