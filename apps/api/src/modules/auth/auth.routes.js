"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_refresh_controller_1 = require("./auth.refresh.controller");
const requireAuth_1 = require("../../middleware/requireAuth");
const auth_logout_controller_1 = require("./auth.logout.controller");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.register);
router.post("/login", auth_controller_1.login);
router.post("/refresh", auth_refresh_controller_1.refresh);
router.post("/logout", requireAuth_1.requireAuth, auth_logout_controller_1.logout);
router.post("/logout-all", requireAuth_1.requireAuth, auth_logout_controller_1.logoutAll);
router.get("/me", requireAuth_1.requireAuth, auth_controller_1.me);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map