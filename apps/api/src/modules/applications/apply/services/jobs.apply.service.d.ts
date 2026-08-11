import { ApplyJobBody } from "../validator";
export declare function applyJob(file: Express.Multer.File, applicationData: ApplyJobBody, jobId: string, eligibilityData: ApplyJobBody["eligibility"], submissionData: ApplyJobBody["submission"]): Promise<{
    applicationId: `${string}-${string}-${string}-${string}-${string}`;
    passed: boolean;
    taskId: null;
    taskType: null;
} | {
    applicationId: `${string}-${string}-${string}-${string}-${string}`;
    passed: boolean;
    taskId: `${string}-${string}-${string}-${string}-${string}`;
    taskType: string;
}>;
//# sourceMappingURL=jobs.apply.service.d.ts.map