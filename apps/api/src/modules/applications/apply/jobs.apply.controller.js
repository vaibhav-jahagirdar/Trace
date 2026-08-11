"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyJobController = applyJobController;
const validator_1 = require("./validator");
const jobs_apply_service_1 = require("./services/jobs.apply.service");
async function applyJobController(req, res, next) {
    try {
        const { jobId } = validator_1.applyJobParamsSchema.parse(req.params);
        const applicationData = validator_1.applyJobBodySchema.parse(req.body);
        const result = await (0, jobs_apply_service_1.applyJob)(req.file, applicationData, jobId, applicationData.eligibility, applicationData.submission);
        const statusCode = result.passed ? 202 : 201;
        res.status(statusCode).json(result);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=jobs.apply.controller.js.map