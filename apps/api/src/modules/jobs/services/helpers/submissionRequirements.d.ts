import type { JobSubmissionRequirementsInput } from "../../validators/create/jobs.validator";
import { PoolClient } from "pg";
export declare function createJobSubmissionRequirementsRecord(submissionRequirementsData: JobSubmissionRequirementsInput, jobId: string, client: PoolClient): Promise<any>;
//# sourceMappingURL=submissionRequirements.d.ts.map