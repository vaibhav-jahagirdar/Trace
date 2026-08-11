import type { CreateJobInput } from "../../validators/create/jobs.validator";
import { PoolClient } from "pg";
export declare function createJobRecord(membershipId: string, orgId: string, jobData: CreateJobInput, client: PoolClient): Promise<{
    jobId: any;
    roleCategoryId: any;
}>;
//# sourceMappingURL=createJobRecords.d.ts.map