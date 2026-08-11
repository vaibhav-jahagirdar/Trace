import { JobsOptions, Queue } from "bullmq";
export interface ResumeAnalysisJobData {
    jobId: string;
    applicationId: string;
    taskId: string;
}
export declare const resumeAnalysisQueue: Queue<ResumeAnalysisJobData, any, string, ResumeAnalysisJobData, any, string>;
export declare function enqueueResumeAnalysis(data: ResumeAnalysisJobData, options?: JobsOptions): Promise<import("bullmq").Job<ResumeAnalysisJobData, any, string>>;
//# sourceMappingURL=producer.d.ts.map