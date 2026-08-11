import { PoolClient } from "pg";
export interface JobEvaluationPriorityRow {
    code: string;
    name: string;
    description: string | null;
    weight: number;
}
export declare function getJobEvaluationPriorities(client: PoolClient, jobId: string): Promise<JobEvaluationPriorityRow[]>;
//# sourceMappingURL=getJobEvaluationPriorities.d.ts.map