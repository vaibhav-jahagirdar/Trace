import { PoolClient } from "pg";
export declare function authorizeResumeAnalysisRequest(client: PoolClient, userId: string, organizationId: string): Promise<void>;
export declare function claimResumeParseTask(client: PoolClient, taskId: string): Promise<{
    applicationId: string | undefined;
}>;
export declare function validateResumeAnalysisRequest(client: PoolClient, userId: string, organizationId: string, jobId: string, applicationId: string, taskId: string): Promise<void>;
//# sourceMappingURL=validateCvAnalysisRequest.d.ts.map