import { PoolClient } from "pg";
export interface JobSuccessSignalRow {
    code: string;
    name: string;
    description: string | null;
    weight: number;
}
export declare function getJobSuccessSignals(client: PoolClient, jobId: string): Promise<JobSuccessSignalRow[]>;
//# sourceMappingURL=getJobSuccessSignals.d.ts.map