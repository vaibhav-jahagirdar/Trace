import { ResumeAnalysisResponse } from "../../validators/resumeEvaluation";
export declare class AnalysisServiceError extends Error {
    readonly status?: number | undefined;
    readonly cause?: unknown | undefined;
    constructor(message: string, status?: number | undefined, cause?: unknown | undefined);
}
export declare function analyzeResume(applicationId: string, taskId: string, rawLlmResponse?: string): Promise<ResumeAnalysisResponse & {
    raw_llm_response?: string;
}>;
//# sourceMappingURL=analysis.client.d.ts.map