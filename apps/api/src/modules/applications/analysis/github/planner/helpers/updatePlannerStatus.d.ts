import { PoolClient } from "pg";
export declare function markPlanningStarted(client: PoolClient, taskId: string): Promise<void>;
export declare function markPlannerLlmCompleted(client: PoolClient, taskId: string, plannerModel: string, plannerPromptVersion: string, plannerInputHash: string, plannerRawOutput: object): Promise<void>;
export declare function markPlanningCompleted(client: PoolClient, taskId: string, plannerOutput: object): Promise<void>;
export declare function markPlanningFailed(client: PoolClient, taskId: string, error: unknown): Promise<void>;
export declare function getPlannerCheckpoint(client: PoolClient, taskId: string): Promise<{
    planning_status: "PENDING" | "RUNNING" | "LLM_COMPLETED" | "COMPLETED" | "FAILED";
    planner_input_hash: string | null;
    planner_raw_output: object | null;
    planner_output: object | null;
} | null>;
//# sourceMappingURL=updatePlannerStatus.d.ts.map