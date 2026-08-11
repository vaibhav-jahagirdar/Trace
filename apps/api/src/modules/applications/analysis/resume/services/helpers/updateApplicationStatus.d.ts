import { PoolClient } from "pg";
export declare function markTaskInProgress(client: PoolClient, taskId: string): Promise<void>;
export declare function markTaskCompleted(client: PoolClient, taskId: string): Promise<void>;
export declare function markTaskFailed(client: PoolClient, taskId: string, error: unknown, attemptsMade: number, maxAttempts: number): Promise<void>;
//# sourceMappingURL=updateApplicationStatus.d.ts.map