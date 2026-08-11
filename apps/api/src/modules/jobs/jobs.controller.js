"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobController = createJobController;
exports.getJobDraftController = getJobDraftController;
exports.saveJobDraftController = saveJobDraftController;
exports.publishJobController = publishJobController;
exports.getJobController = getJobController;
const jobs_create_service_1 = require("./services/jobs.create.service");
const jobs_publish_service_1 = require("./services/[jobId]/jobs.publish.service");
const job_get_service_1 = require("./services/[jobId]/job.get.service");
const jobDraft_1 = require("./services/helpers/jobDraft");
async function createJobController(req, res, next) {
    try {
        const userId = req.user?.id;
        const orgId = req.params.orgId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (typeof orgId !== "string") {
            return res.status(400).json({ message: "Invalid orgId" });
        }
        const { draftId, eligibility, submission_requirements, requirements, evaluation_priorities, evidence_priorities, success_signals, ...jobData } = req.body;
        if (typeof draftId !== "string") {
            return res.status(400).json({ message: "Invalid draftId" });
        }
        const result = await (0, jobs_create_service_1.createJob)(userId, orgId, draftId, jobData, eligibility, submission_requirements, requirements, evaluation_priorities, evidence_priorities, success_signals);
        if ("alreadySubmitted" in result && result.alreadySubmitted) {
            return res.status(200).json(result);
        }
        return res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
}
async function getJobDraftController(req, res, next) {
    try {
        const userId = req.user?.id;
        const orgId = req.params.orgId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (typeof orgId !== "string") {
            return res.status(400).json({ message: "Invalid orgId" });
        }
        const draft = await (0, jobDraft_1.getActiveDraft)(userId, orgId);
        return res.status(200).json({ draft });
    }
    catch (error) {
        next(error);
    }
}
async function saveJobDraftController(req, res, next) {
    try {
        const userId = req.user?.id;
        const orgId = req.params.orgId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (typeof orgId !== "string") {
            return res.status(400).json({ message: "Invalid orgId" });
        }
        const { formData, currentStep } = req.body;
        if (typeof formData !== "object" || formData === null) {
            return res.status(400).json({ message: "Invalid formData" });
        }
        if (typeof currentStep !== "number") {
            return res.status(400).json({ message: "Invalid currentStep" });
        }
        const draft = await (0, jobDraft_1.upsertDraft)(userId, orgId, formData, currentStep);
        return res.status(200).json({ draft });
    }
    catch (error) {
        next(error);
    }
}
async function publishJobController(req, res, next) {
    try {
        const userId = req.user?.id;
        const orgId = req.params.orgId;
        const jobId = req.params.jobId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (typeof orgId !== "string" || typeof jobId !== "string") {
            return res.status(400).json({ message: "Invalid route params" });
        }
        const result = await (0, jobs_publish_service_1.publishJob)(jobId, orgId, userId);
        return res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}
async function getJobController(req, res, next) {
    try {
        const jobId = req.params.jobId;
        if (typeof jobId !== "string") {
            return res.status(400).json({ message: "Invalid jobId" });
        }
        const result = await (0, job_get_service_1.getJob)(jobId);
        return res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=jobs.controller.js.map