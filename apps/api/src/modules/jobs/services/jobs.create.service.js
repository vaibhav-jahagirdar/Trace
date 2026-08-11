"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
const transaction_1 = require("../../../config/transaction");
const membershipCheck_1 = require("../../../helpers/membershipCheck");
const createJobRecords_1 = require("./helpers/createJobRecords");
const eligibilityCriteria_1 = require("./helpers/eligibilityCriteria");
const submissionRequirements_1 = require("./helpers/submissionRequirements");
const jobRequirements_1 = require("./helpers/jobRequirements");
const requirements_1 = require("../logic/requirements");
const requirements_2 = require("../logic/requirements");
const evaluation_1 = require("../logic/evaluation");
const evaluationRecord_1 = require("./helpers/evaluationRecord");
const evidence_1 = require("../logic/evidence");
const evidenceRecord_1 = require("./helpers/evidenceRecord");
const success_1 = require("../logic/success");
const successRecord_1 = require("./helpers/successRecord");
const jobDraft_1 = require("./helpers/jobDraft");
async function createJob(userId, orgId, draftId, jobData, eligibilityCriteriaData, submissionRequirementsData, requirements, evaluationPriorities, evidencePriorities, successSignals) {
    return (0, transaction_1.withTransaction)(async (client) => {
        const draft = await (0, jobDraft_1.getDraftById)(draftId, userId, orgId, client);
        if (draft.status === "COMPLETED") {
            return { jobId: draft.job_id, alreadySubmitted: true };
        }
        const membership = await (0, membershipCheck_1.getActiveMembership)(userId, orgId, client);
        (0, membershipCheck_1.assertMinimumRole)(membership.role, "RECRUITER");
        const { jobId, roleCategoryId } = await (0, createJobRecords_1.createJobRecord)(membership.id, orgId, jobData, client);
        await (0, eligibilityCriteria_1.createJobEligibilityCriteriaRecord)(eligibilityCriteriaData, jobId, client);
        await (0, submissionRequirements_1.createJobSubmissionRequirementsRecord)(submissionRequirementsData, jobId, client);
        const role = await (0, requirements_1.getRole)(roleCategoryId, client);
        const weightedRequirements = (0, requirements_2.processJobRequirements)(role, requirements);
        await (0, jobRequirements_1.createJobRequirementRecord)(weightedRequirements, jobId, client);
        (0, evaluation_1.processEvaluationPriorities)(role, evaluationPriorities);
        await (0, evaluationRecord_1.createJobEvaluationPriorityRecords)(evaluationPriorities, jobId, client);
        (0, evidence_1.processEvidencePriorities)(role, evidencePriorities);
        await (0, evidenceRecord_1.createJobEvidencePriorityRecords)(evidencePriorities, jobId, client);
        (0, success_1.processSuccessSignals)(role, successSignals);
        await (0, successRecord_1.createSuccessSignalRecord)(jobId, successSignals, client);
        await (0, jobDraft_1.markDraftCompleted)(draftId, jobId, client);
        return { jobId };
    });
}
//# sourceMappingURL=jobs.create.service.js.map