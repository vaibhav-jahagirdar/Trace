"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJobRoleCategoriesController = listJobRoleCategoriesController;
exports.getJobRoleCategoryController = getJobRoleCategoryController;
exports.createJobRoleCategoryController = createJobRoleCategoryController;
exports.updateJobRoleCategoryController = updateJobRoleCategoryController;
exports.deleteJobRoleCategoryController = deleteJobRoleCategoryController;
errorHandler_1.ValidationError;
const jobRoleCategory_service_1 = require("../services/jobRoleCategory.service");
const errorHandler_1 = require("../../../middleware/errorHandler");
function getRoleCategoryId(req) {
    const { roleCategoryId } = req.params;
    if (typeof roleCategoryId !== "string" ||
        !roleCategoryId) {
        throw new errorHandler_1.ValidationError("Role category id is required.");
    }
    return roleCategoryId;
}
async function listJobRoleCategoriesController(req, res) {
    const categories = await (0, jobRoleCategory_service_1.listJobRoleCategories)();
    res.status(200).json({
        data: categories,
    });
}
async function getJobRoleCategoryController(req, res) {
    const roleCategoryId = getRoleCategoryId(req);
    const category = await (0, jobRoleCategory_service_1.getJobRoleCategory)(roleCategoryId);
    res.status(200).json({
        data: category,
    });
}
async function createJobRoleCategoryController(req, res) {
    const category = await (0, jobRoleCategory_service_1.createJobRoleCategory)(req.body);
    res.status(201).json({
        data: category,
    });
}
async function updateJobRoleCategoryController(req, res) {
    const roleCategoryId = getRoleCategoryId(req);
    const category = await (0, jobRoleCategory_service_1.updateJobRoleCategory)(roleCategoryId, req.body);
    res.status(200).json({
        data: category,
    });
}
async function deleteJobRoleCategoryController(req, res) {
    const roleCategoryId = getRoleCategoryId(req);
    const result = await (0, jobRoleCategory_service_1.deleteJobRoleCategory)(roleCategoryId);
    res.status(200).json({
        data: result,
    });
}
//# sourceMappingURL=jobRoleCategory.controller.js.map