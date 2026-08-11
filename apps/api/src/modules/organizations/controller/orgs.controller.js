"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationHandler = exports.createOrganizationHandler = void 0;
const orgs_validator_1 = require("../orgs.validator");
const orgs_create_service_1 = require("../services/orgs.create.service");
const orgs_fetch_service_1 = require("../services/orgs.fetch.service");
const asyncHandler_1 = require("../../../middleware/asyncHandler");
const errorHandler_1 = require("../../../middleware/errorHandler");
exports.createOrganizationHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new errorHandler_1.UnauthorizedError("Unauthorized");
    }
    const data = orgs_validator_1.createOrganizationSchema.parse(req.body);
    const result = await (0, orgs_create_service_1.createOrganization)(data, userId);
    res.status(201).json({
        message: "Organization created successfully",
        data: result,
    });
});
exports.getOrganizationHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { orgId } = req.params;
    if (!orgId || Array.isArray(orgId)) {
        throw new errorHandler_1.ValidationError("Invalid organization id");
    }
    const organization = await (0, orgs_fetch_service_1.fetchOrganizationInfo)(orgId);
    res.status(200).json({
        message: "Organization fetched successfully",
        data: organization,
    });
});
//# sourceMappingURL=orgs.controller.js.map