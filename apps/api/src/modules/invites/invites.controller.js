"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptPlatformInvite = exports.validatePlatformInvite = exports.createPlatformInvite = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const invites_validator_1 = require("./invites.validator");
const errorHandler_1 = require("../../middleware/errorHandler");
const invites_validate_service_1 = require("./services/invites.validate.service");
const invites_accept_service_1 = require("./services/invites.accept.service");
const auth_controller_1 = require("../auth/auth.controller");
const invites_service_1 = require("./services/invites.service");
exports.createPlatformInvite = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = invites_validator_1.createInviteSchema.parse(req.body);
    const userId = req.user?.id;
    if (!userId) {
        throw new errorHandler_1.ValidationError("User ID is required to create an invite");
    }
    const invite = await (0, invites_service_1.createInvite)(data, userId);
    res.status(201).json({
        message: "Platform invite created successfully",
        data: {
            inviteId: invite.inviteId,
            email: invite.email,
            expiresAt: invite.expiresAt,
        },
    });
});
exports.validatePlatformInvite = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.query.token;
    const invite = await (0, invites_validate_service_1.validateInvite)(token);
    res.status(200).json({
        message: "Invite validated successfully",
        data: invite,
    });
});
exports.acceptPlatformInvite = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = invites_validator_1.acceptInviteSchema.parse(req.body);
    const meta = (0, auth_controller_1.extractSessionMeta)(req);
    const result = await (0, invites_accept_service_1.acceptInvite)(data, meta);
    (0, auth_controller_1.setAuthCookies)(res, result.tokens.accessToken, result.tokens.refreshToken);
    res.status(201).json({
        message: "Invite accepted successfully",
        data: {
            userId: result.userId,
            email: result.email,
        },
    });
});
//# sourceMappingURL=invites.controller.js.map