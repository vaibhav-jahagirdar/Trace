interface RepositoryPlannerPayload {
    job_context: unknown;
    candidate_context: unknown;
    stage_1: unknown;
    github_url: string;
}
export declare class RepositoryPlannerContextError extends Error {
    constructor(message: string);
}
export declare function getRepositoryPlannerPayload(applicationId: string, jobId: string, taskId: string): Promise<RepositoryPlannerPayload>;
export {};
//# sourceMappingURL=repoAnalysisPayload.d.ts.map