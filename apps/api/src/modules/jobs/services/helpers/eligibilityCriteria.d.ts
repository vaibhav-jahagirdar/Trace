import type { JobEligibilityCriteriaInput } from "../../validators/create/jobs.validator";
import { PoolClient } from "pg";
export declare function createJobEligibilityCriteriaRecord(eligibilityCriteriaData: JobEligibilityCriteriaInput, jobId: string, client: PoolClient): Promise<any>;
//# sourceMappingURL=eligibilityCriteria.d.ts.map