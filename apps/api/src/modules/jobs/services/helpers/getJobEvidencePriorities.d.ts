import { PoolClient } from "pg";
export interface JobEvidencePriorityRow {
    code: string;
    name: string;
    description: string | null;
    weight: number;
}
export declare function getJobEvidencePriorities(client: PoolClient, jobId: string): Promise<JobEvidencePriorityRow[]>;
//# sourceMappingURL=getJobEvidencePriorities.d.ts.map