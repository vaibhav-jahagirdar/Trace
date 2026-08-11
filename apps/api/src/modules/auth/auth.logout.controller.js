"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutAll = exports.logout = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const errorHandler_1 = require("../../middleware/errorHandler");
const auth_logout_service_1 = require("./auth.logout.service");
const auth_controller_1 = require("./auth.controller");
function clearAuthCookies(res) {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: auth_controller_1.IS_PRODUCTION,
        sameSite: "strict",
        path: "/",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: auth_controller_1.IS_PRODUCTION,
        sameSite: "strict",
        path: "/auth/refresh",
    });
}
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        throw new errorHandler_1.ValidationError("Refresh token is required");
    }
    if (!req.user?.id) {
        throw new errorHandler_1.UnauthorizedError("Unauthorized");
    }
    await (0, auth_logout_service_1.logout)({ refreshToken }, req.user.id);
    clearAuthCookies(res);
    res.status(200).json({
        message: "Logged out successfully",
    });
});
exports.logoutAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.id) {
        throw new errorHandler_1.UnauthorizedError("Unauthorized");
    }
    const { revokedCount } = await (0, auth_logout_service_1.logoutAll)(req.user.id);
    clearAuthCookies(res);
    res.status(200).json({
        message: "Logged out from all devices successfully",
        data: {
            revokedCount,
        },
    });
});
//# sourceMappingURL=auth.logout.controller.js.map