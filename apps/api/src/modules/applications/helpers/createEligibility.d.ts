import { PoolClient } from "pg";
import { ApplyJobBody } from "../apply/validator";
export declare function createEligibilityRecord(client: PoolClient, applicationId: string, eligibilityData: ApplyJobBody["eligibility"]): Promise<void>;
//# sourceMappingURL=createEligibility.d.ts.map