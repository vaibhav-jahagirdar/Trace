"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = logout;
exports.logoutAll = logoutAll;
const transaction_1 = require("../../config/transaction");
const auth_service_1 = require("./auth.service");
const errorHandler_1 = require("../../middleware/errorHandler");
async function logout(data, userId) {
    return (0, transaction_1.withTransaction)(async (client) => {
        if (!data.refreshToken) {
            throw new errorHandler_1.UnauthorizedError("Refresh token required");
        }
        const hashedRefreshToken = (0, auth_service_1.hashRefreshToken)(data.refreshToken);
        const tokenResult = await client.query(`
      SELECT id, user_id, revoked_at
      FROM user_sessions
      WHERE refresh_token_hash = $1
        AND user_id = $2
        AND expires_at > NOW()
      FOR UPDATE
      `, [hashedRefreshToken, userId]);
        if (tokenResult.rows.length === 0) {
            throw new errorHandler_1.UnauthorizedError("Invalid session");
        }
        const { revoked_at: revokedAt } = tokenResult.rows[0];
        if (revokedAt !== null) {
            throw new errorHandler_1.UnauthorizedError("Session already revoked");
        }
        await client.query(`
      UPDATE user_sessions
      SET
        revoked_at = NOW(),
        revoked_reason = 'LOGOUT'
      WHERE refresh_token_hash = $1
        AND user_id = $2
      `, [hashedRefreshToken, userId]);
    });
}
async function logoutAll(userId) {
    return (0, transaction_1.withTransaction)(async (client) => {
        const result = await client.query(`
      UPDATE user_sessions
      SET
        revoked_at = NOW(),
        revoked_reason = 'LOGOUT_ALL'
      WHERE user_id = $1
        AND revoked_at IS NULL
      RETURNING id
      `, [userId]);
        if (result.rowCount === 0) {
            throw new errorHandler_1.UnauthorizedError("No active sessions found");
        }
        return { revokedCount: result.rowCount };
    });
}
//# sourceMappingURL=auth.logout.service.js.map