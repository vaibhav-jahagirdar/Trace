import { PoolClient } from "pg";
import type { ScoreResult } from "../../../../scoring/resume";
export interface ResumeAnalysisResult {
    candidate: any;
    evaluation: any;
    scoreResult: ScoreResult;
}
export declare function resumeAnalysis(jobId: string, applicationId: string, taskId: string, client: PoolClient): Promise<ResumeAnalysisResult>;
//# sourceMappingURL=resumeAnalysis.service.d.ts.map