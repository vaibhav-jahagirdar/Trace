import type { JobEvidencePrioritiesInput } from "../../validators/create/jobs.validator";
import { PoolClient } from "pg";
export declare function createJobEvidencePriorityRecords(evidencePriorities: JobEvidencePrioritiesInput, jobId: string, client: PoolClient): Promise<any[]>;
//# sourceMappingURL=evidenceRecord.d.ts.map