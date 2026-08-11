"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../../middleware/requireAuth");
const requireMembership_1 = require("../../middleware/requireMembership");
const validateParams_1 = require("../../middleware/validateParams");
const jobs_controller_1 = require("./jobs.controller");
const jobs_controller_2 = require("./jobs.controller");
const jobs_controller_3 = require("./jobs.controller");
const orgs_validator_1 = require("../organizations/orgs.validator");
const router = (0, express_1.Router)({ mergeParams: true });
router.post("/", requireAuth_1.requireAuth, requireMembership_1.requireMembership, (0, validateParams_1.validateParams)(orgs_validator_1.orgIdParamSchema), jobs_controller_1.createJobController);
router.post("/:jobId/publish", requireAuth_1.requireAuth, requireMembership_1.requireMembership, jobs_controller_1.publishJobController);
router.get("/draft", requireAuth_1.requireAuth, requireMembership_1.requireMembership, (0, validateParams_1.validateParams)(orgs_validator_1.orgIdParamSchema), jobs_controller_2.getJobDraftController);
router.put("/draft", requireAuth_1.requireAuth, requireMembership_1.requireMembership, (0, validateParams_1.validateParams)(orgs_validator_1.orgIdParamSchema), jobs_controller_3.saveJobDraftController);
router.get("/:jobId", jobs_controller_1.getJobController);
exports.default = router;
//# sourceMappingURL=jobs.route.js.map