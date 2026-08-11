import { PoolClient } from "pg";
import type { WeightedJobRequirementInput } from "../../logic/requirements";
export declare function createJobRequirementRecord(requirements: WeightedJobRequirementInput[], jobId: string, client: PoolClient): Promise<any[]>;
//# sourceMappingURL=jobRequirements.d.ts.map