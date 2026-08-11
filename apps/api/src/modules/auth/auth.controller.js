"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = exports.register = exports.IS_PRODUCTION = void 0;
exports.extractSessionMeta = extractSessionMeta;
exports.setAuthCookies = setAuthCookies;
const auth_validator_1 = require("./auth.validator");
const auth_service_1 = require("./auth.service");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const ua_parser_js_1 = require("ua-parser-js");
const errorHandler_1 = require("../../middleware/errorHandler");
const REFRESH_TOKEN_EXPIRY_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS) || 7;
exports.IS_PRODUCTION = process.env.NODE_ENV === "production";
function extractSessionMeta(req) {
    const ua = (0, ua_parser_js_1.UAParser)(req.headers["user-agent"] ?? "");
    return {
        ip_address: req.ip ?? null,
        user_agent: req.headers["user-agent"] ?? null,
        device_name: ua.device.model ?? null,
        platform: ua.os.name ?? null,
        browser: ua.browser.name ?? null,
    };
}
function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: exports.IS_PRODUCTION,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
        path: "/",
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: exports.IS_PRODUCTION,
        sameSite: "strict",
        maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
        path: "/api/auth/refresh",
    });
}
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = auth_validator_1.registerSchema.parse(req.body);
    const meta = extractSessionMeta(req);
    const { userId, tokens } = await (0, auth_service_1.registerUser)(data, meta);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.status(201).json({
        message: "Account created successfully",
        data: { userId },
    });
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = auth_validator_1.loginSchema.parse(req.body);
    const meta = extractSessionMeta(req);
    const { userId, tokens } = await (0, auth_service_1.loginUser)(data, meta);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.status(200).json({
        message: "Login successful",
        data: { userId },
    });
});
exports.me = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new errorHandler_1.UnauthorizedError("User not authenticated");
    const data = await (0, auth_service_1.getUserWithOrgs)(userId);
    res.json({ data });
});
//# sourceMappingURL=auth.controller.js.map