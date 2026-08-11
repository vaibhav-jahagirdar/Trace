"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const errorHandler_1 = require("./errorHandler");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}
async function requireAuth(req, _res, next) {
    try {
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) {
            throw new errorHandler_1.UnauthorizedError("Authentication required");
        }
        const payload = jsonwebtoken_1.default.verify(accessToken, JWT_SECRET);
        if (typeof payload !== "object" ||
            payload === null ||
            !("userId" in payload) ||
            !("sessionId" in payload)) {
            throw new errorHandler_1.UnauthorizedError("Invalid token");
        }
        const { userId, sessionId, } = payload;
        const sessionResult = await (0, db_1.getDb)().query(`
        SELECT id
        FROM user_sessions
        WHERE id = $1
          AND user_id = $2
          AND revoked_at IS NULL
          AND expires_at > NOW()
        `, [
            sessionId,
            userId,
        ]);
        if (sessionResult.rows.length === 0) {
            throw new errorHandler_1.UnauthorizedError("Session expired");
        }
        req.user = {
            id: userId,
            sessionId,
        };
        next();
    }
    catch (error) {
        next(new errorHandler_1.UnauthorizedError("Invalid session"));
    }
}
//# sourceMappingURL=requireAuth.js.map