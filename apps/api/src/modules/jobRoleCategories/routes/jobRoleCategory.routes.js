"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobRoleCategory_controller_1 = require("../controllers/jobRoleCategory.controller");
const router = (0, express_1.Router)();
router.get("/", jobRoleCategory_controller_1.listJobRoleCategoriesController);
router.get("/:roleCategoryId", jobRoleCategory_controller_1.getJobRoleCategoryController);
router.post("/", jobRoleCategory_controller_1.createJobRoleCategoryController);
router.patch("/:roleCategoryId", jobRoleCategory_controller_1.updateJobRoleCategoryController);
router.delete("/:roleCategoryId", jobRoleCategory_controller_1.deleteJobRoleCategoryController);
exports.default = router;
//# sourceMappingURL=jobRoleCategory.routes.js.map