import { PoolClient } from "pg";
import { JobSuccessSignalsInput } from "../../validators/create/jobs.validator";
export declare function createSuccessSignalRecord(jobId: string, successSignals: JobSuccessSignalsInput, client: PoolClient): Promise<any[]>;
//# sourceMappingURL=successRecord.d.ts.map