export declare function getResumeAnalysisPayload(applicationId: string, taskId: string): Promise<{
    resumeObjectKey: string | null;
    analysisContext: {
        job: import("../../../../jobs/services/helpers/toEvaluationContextDto").EvaluationContextDto;
        candidate: import("../../../[applicationId]/helpers/toApplicationContextDto").ApplicationContextDto;
    };
}>;
//# sourceMappingURL=contextBuilder.service.d.ts.map