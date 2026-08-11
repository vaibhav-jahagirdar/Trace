import { PoolClient } from "pg";
export type PlanningStatus = "PENDING" | "RUNNING" | "LLM_COMPLETED" | "COMPLETED" | "FAILED";
export interface PlannerCheckpoint {
    id: string;
    planning_status: PlanningStatus;
    planner_input_hash: string | null;
    planner_model: string | null;
    planner_prompt_version: string | null;
    planner_raw_output: object | null;
    planner_output: object | null;
}
export declare function markPlanningStarted(client: PoolClient, taskId: string): Promise<void>;
export declare function checkpointPlannerLLM(client: PoolClient, taskId: string, plannerModel: string, plannerPromptVersion: string, plannerInputHash: string, rawPlannerOutput: object): Promise<void>;
export declare function storePlannerResult(client: PoolClient, taskId: string, validatedPlannerOutput: object): Promise<string>;
export declare function markPlanningFailed(client: PoolClient, taskId: string, error: string): Promise<void>;
export declare function getPlannerCheckpoint(client: PoolClient, taskId: string): Promise<PlannerCheckpoint | null>;
//# sourceMappingURL=checkpoint.d.ts.map