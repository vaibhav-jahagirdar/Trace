"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyJob = applyJob;
const crypto_1 = require("crypto");
const transaction_1 = require("../../../../config/transaction");
const fileValidation_1 = require("../../../../helpers/fileValidation");
const errorHandler_1 = require("../../../../middleware/errorHandler");
const r2_service_1 = require("../../../../storage/r2.service");
const getPublishedJob_1 = require("../../../jobs/services/helpers/getPublishedJob");
const getJobDto_1 = require("../../../jobs/services/helpers/getJobDto");
const createApplication_1 = require("../../helpers/createApplication");
const createEligibility_1 = require("../../helpers/createEligibility");
const createSubmission_1 = require("../../helpers/createSubmission");
const createTechAndConcepts_1 = require("../../helpers/createTechAndConcepts");
const evaluation_1 = require("../logic/evaluation");
const producer_1 = require("../../../../queues/producer");
async function applyJob(file, applicationData, jobId, eligibilityData, submissionData) {
    (0, fileValidation_1.validateResumeFile)(file);
    const applicationId = (0, crypto_1.randomUUID)();
    const { objectKey, fileName, mimeType, fileSize, sha256 } = await (0, r2_service_1.uploadResume)({
        applicationId,
        file,
    });
    const result = await (0, transaction_1.withTransaction)(async (client) => {
        const jobRow = await (0, getPublishedJob_1.getPublishedJob)(client, jobId);
        if (!jobRow) {
            throw new errorHandler_1.NotFoundError("Job not found");
        }
        const jobResult = (0, getJobDto_1.toGetJobDto)(jobRow);
        await (0, createApplication_1.createApplicationRecord)(client, applicationId, jobId, applicationData);
        await (0, createEligibility_1.createEligibilityRecord)(client, applicationId, eligibilityData);
        await (0, createSubmission_1.createSubmissionRecord)(submissionData, client, applicationId, jobResult, objectKey, fileName, mimeType, fileSize, sha256);
        await (0, createTechAndConcepts_1.insertApplicationConcepts)(client, applicationId, applicationData.concepts);
        await (0, createTechAndConcepts_1.insertApplicationTechnologies)(client, applicationId, applicationData.technologies);
        const hardGateResult = (0, evaluation_1.evaluateHardGate)(jobResult, eligibilityData);
        if (!hardGateResult.passed) {
            await client.query(`UPDATE job_applications
            SET status = 'REJECTED',
                rejection_source = 'SYSTEM',
                rejection_reason = $1,
                rejected_at = NOW()
          WHERE id = $2
            AND job_id = $3
            AND status <> 'REJECTED'`, [
                hardGateResult.primaryRejectionCode,
                applicationId,
                jobId,
            ]);
            return {
                applicationId,
                passed: false,
                taskId: null,
                taskType: null,
            };
        }
        const taskId = (0, crypto_1.randomUUID)();
        const taskType = "RESUME_PARSE";
        await client.query(`INSERT INTO application_tasks (
          id,
          job_application_id,
          task_type
        )
        VALUES ($1, $2, $3)`, [
            taskId,
            applicationId,
            taskType,
        ]);
        await client.query(`UPDATE job_applications
          SET status = 'QUEUED'
        WHERE id = $1`, [applicationId]);
        return {
            applicationId,
            passed: true,
            taskId,
            taskType,
        };
    });
    if (result.passed) {
        await (0, producer_1.enqueueResumeAnalysis)({
            taskId: result.taskId,
            applicationId: result.applicationId,
            jobId,
        });
    }
    return result;
}
//# sourceMappingURL=jobs.apply.service.js.map