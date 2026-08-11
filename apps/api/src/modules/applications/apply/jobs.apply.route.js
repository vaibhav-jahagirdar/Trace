"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../../../middleware/upload");
const jobs_apply_controller_1 = require("./jobs.apply.controller");
const validateParams_1 = require("../../../middleware/validateParams");
const router = (0, express_1.Router)();
router.post("/jobs/:jobId/applications", validateParams_1.validateParams, upload_1.uploadResume, jobs_apply_controller_1.applyJobController);
exports.default = router;
//# sourceMappingURL=jobs.apply.route.js.map