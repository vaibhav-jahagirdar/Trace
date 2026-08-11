"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResumeAnalysisPayload = getResumeAnalysisPayload;
const applicationContext_service_1 = require("../../../[applicationId]/services/applicationContext.service");
const evaluationContext_1 = require("../../../../jobs/services/[jobId]/evaluationContext");
async function getResumeAnalysisPayload(applicationId, taskId) {
    const application = await (0, applicationContext_service_1.getApplicationContext)(applicationId);
    const job = await (0, evaluationContext_1.getEvaluationContext)(application.jobId);
    return {
        resumeObjectKey: application.resumeObjectKey,
        analysisContext: {
            job,
            candidate: application.context,
        },
    };
}
//# sourceMappingURL=contextBuilder.service.js.map