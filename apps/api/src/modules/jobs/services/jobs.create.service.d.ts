import type { CreateJobInput, JobSuccessSignalsInput } from "../validators/create/jobs.validator";
import type { JobEligibilityCriteriaInput } from "../validators/create/jobs.validator";
import type { JobSubmissionRequirementsInput } from "../validators/create/jobs.validator";
import type { JobRequirementsInput } from "../validators/create/jobs.validator";
import { JobEvaluationPrioritiesInput } from "../validators/create/jobs.validator";
import { JobEvidencePrioritiesInput } from "../validators/create/jobs.validator";
export declare function createJob(userId: string, orgId: string, draftId: string, jobData: CreateJobInput, eligibilityCriteriaData: JobEligibilityCriteriaInput, submissionRequirementsData: JobSubmissionRequirementsInput, requirements: JobRequirementsInput, evaluationPriorities: JobEvaluationPrioritiesInput, evidencePriorities: JobEvidencePrioritiesInput, successSignals: JobSuccessSignalsInput): Promise<{
    jobId: string;
    alreadySubmitted: boolean;
} | {
    jobId: any;
    alreadySubmitted?: never;
}>;
//# sourceMappingURL=jobs.create.service.d.ts.map