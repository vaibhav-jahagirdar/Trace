"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invites_controller_1 = require("./invites.controller");
const requireAuth_1 = require("../../middleware/requireAuth");
const router = (0, express_1.Router)();
router.post("/", requireAuth_1.requireAuth, invites_controller_1.createPlatformInvite);
router.get("/validate", invites_controller_1.validatePlatformInvite);
router.post("/accept", invites_controller_1.acceptPlatformInvite);
exports.default = router;
//# sourceMappingURL=invites.routes.js.map