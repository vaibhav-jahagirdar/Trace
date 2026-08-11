"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeRefreshToken = revokeRefreshToken;
exports.refreshTokenRotation = refreshTokenRotation;
const auth_service_1 = require("./auth.service");
const transaction_1 = require("../../config/transaction");
const errorHandler_1 = require("../../middleware/errorHandler");
async function revokeRefreshToken(client, revokedReason, userId) {
    await client.query(`
    UPDATE user_sessions
    SET
      revoked_at = NOW(),
      revoked_reason = $1
    WHERE user_id = $2
      AND revoked_at IS NULL
    `, [revokedReason, userId]);
}
async function refreshTokenRotation(data, meta) {
    return (0, transaction_1.withTransaction)(async (client) => {
        if (!data.refreshToken) {
            throw new errorHandler_1.UnauthorizedError("Refresh token required");
        }
        const hashedRefreshToken = (0, auth_service_1.hashRefreshToken)(data.refreshToken);
        const tokenResult = await client.query(`
      SELECT
        id,
        user_id,
        revoked_at,
        revoked_reason
      FROM user_sessions
      WHERE refresh_token_hash = $1
        AND expires_at > NOW()
      FOR UPDATE
      `, [hashedRefreshToken]);
        if (tokenResult.rows.length === 0) {
            throw new errorHandler_1.UnauthorizedError("Invalid session");
        }
        const { id: oldSessionId, user_id: userId, revoked_at: revokedAt, } = tokenResult.rows[0];
        if (revokedAt !== null) {
            await revokeRefreshToken(client, "Refresh token reuse detected", userId);
            throw new errorHandler_1.UnauthorizedError("Token reuse detected. All sessions revoked.");
        }
        const newRefreshToken = (0, auth_service_1.generateRefreshToken)();
        const newRefreshTokenHash = (0, auth_service_1.hashRefreshToken)(newRefreshToken);
        const expiresAt = (0, auth_service_1.getRefreshTokenExpiry)();
        const newSessionResult = await client.query(`
        INSERT INTO user_sessions (
          user_id,
          refresh_token_hash,
          parent_session_id,
          user_agent,
          ip_address,
          device_name,
          platform,
          browser,
          expires_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9
        )
        RETURNING id
        `, [
            userId,
            newRefreshTokenHash,
            oldSessionId,
            meta.user_agent ?? null,
            meta.ip_address ?? null,
            meta.device_name ?? null,
            meta.platform ?? null,
            meta.browser ?? null,
            expiresAt,
        ]);
        const newSessionId = newSessionResult.rows[0]?.id;
        if (!newSessionId) {
            throw new errorHandler_1.AppError("Failed to create new session", 500, "SESSION_CREATION_FAILED");
        }
        await client.query(`
      UPDATE user_sessions
      SET
        revoked_at = NOW(),
        revoked_reason = 'ROTATED',
        last_used_at = NOW()
      WHERE id = $1
      `, [oldSessionId]);
        const newAccessToken = (0, auth_service_1.generateAccessToken)(userId, newSessionId);
        return {
            userId,
            tokens: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        };
    });
}
//# sourceMappingURL=auth.refresh.service.js.map