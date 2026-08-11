import { Worker } from "bullmq";
interface ResumeAnalysisJobData {
    jobId: string;
    applicationId: string;
    taskId: string;
}
export declare const resumeAnalysisWorker: Worker<ResumeAnalysisJobData, any, string>;
export {};
//# sourceMappingURL=worker.d.ts.map