"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const errorHandler_1 = require("../../middleware/errorHandler");
const auth_refresh_service_1 = require("./auth.refresh.service");
const auth_controller_1 = require("./auth.controller");
const auth_controller_2 = require("./auth.controller");
exports.refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        throw new errorHandler_1.ValidationError("Refresh token is required");
    }
    const meta = (0, auth_controller_1.extractSessionMeta)(req);
    const { userId, tokens } = await (0, auth_refresh_service_1.refreshTokenRotation)({ refreshToken }, meta);
    (0, auth_controller_2.setAuthCookies)(res, tokens.accessToken, tokens.refreshToken);
    res.status(200).json({
        message: "Token refreshed successfully",
        data: {
            userId,
        },
    });
});
//# sourceMappingURL=auth.refresh.controller.js.map