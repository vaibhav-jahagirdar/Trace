"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../../middleware/requireAuth");
const requireMembership_1 = require("../../middleware/requireMembership");
const validateParams_1 = require("../../middleware/validateParams");
const orgs_validator_1 = require("./orgs.validator");
const orgs_controller_1 = require("./controller/orgs.controller");
const router = (0, express_1.Router)();
router.post("/", requireAuth_1.requireAuth, orgs_controller_1.createOrganizationHandler);
router.get("/:orgId", requireAuth_1.requireAuth, (0, validateParams_1.validateParams)(orgs_validator_1.orgIdParamSchema), requireMembership_1.requireMembership, orgs_controller_1.getOrganizationHandler);
exports.default = router;
//# sourceMappingURL=orgs.routes.js.map