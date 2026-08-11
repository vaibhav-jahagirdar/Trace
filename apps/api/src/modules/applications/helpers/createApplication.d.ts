import { PoolClient } from "pg";
import { ApplyJobBody } from "../apply/validator";
export declare function createApplicationRecord(client: PoolClient, applicationId: string, jobId: string, applicationData: ApplyJobBody): Promise<any>;
//# sourceMappingURL=createApplication.d.ts.map