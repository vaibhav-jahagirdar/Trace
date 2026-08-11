import { PoolClient } from "pg";
export declare function authorizeRepositoryPlannerRequest(client: PoolClient, userId: string, organizationId: string): Promise<void>;
export declare function claimRepositoryPlannerTask(client: PoolClient, taskId: string): Promise<{
    applicationId: string | undefined;
}>;
export declare function validateRepositoryPlannerRequest(client: PoolClient, userId: string, organizationId: string, jobId: string, applicationId: string, taskId: string): Promise<void>;
export declare function validateStage1Completed(client: PoolClient, applicationId: string): Promise<void>;
//# sourceMappingURL=validateRepoAnalysisReq.d.ts.map