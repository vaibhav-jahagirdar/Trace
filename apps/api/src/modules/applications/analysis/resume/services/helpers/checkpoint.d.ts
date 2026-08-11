import { PoolClient } from 'pg';
export declare function storeCheckpoint(client: PoolClient, taskId: string, rawLlmResponse: string, ttlDays?: number): Promise<void>;
export declare function getCheckpoint(client: PoolClient, taskId: string): Promise<string | null>;
export declare function deleteExpiredCheckpoints(client: PoolClient): Promise<number>;
export declare function storePermanentResult(client: PoolClient, taskId: string, requestHash: string, rawLlmResponse: string, cleanedResponse: object): Promise<string>;
export declare function getPermanentResult(client: PoolClient, taskId: string): Promise<{
    request_hash: string;
    raw_llm_response: string;
} | null>;
//# sourceMappingURL=checkpoint.d.ts.map