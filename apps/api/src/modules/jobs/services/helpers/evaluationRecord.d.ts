import { PoolClient } from "pg";
import type { JobEvaluationPrioritiesInput } from "../../validators/create/jobs.validator";
export declare function createJobEvaluationPriorityRecords(evaluationPriorities: JobEvaluationPrioritiesInput, jobId: string, client: PoolClient): Promise<any[]>;
//# sourceMappingURL=evaluationRecord.d.ts.map