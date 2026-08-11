"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptInvite = acceptInvite;
const bcrypt_1 = __importDefault(require("bcrypt"));
const transaction_1 = require("../../../config/transaction");
const errorHandler_1 = require("../../../middleware/errorHandler");
const auth_service_1 = require("../../auth/auth.service");
async function acceptInvite(data, meta) {
    const { token, username, password, first_name, last_name, phone, linkedin_url, avatar_url, } = data;
    return (0, transaction_1.withTransaction)(async (client) => {
        const tokenHash = (0, auth_service_1.hashRefreshToken)(token);
        const inviteResult = await client.query(`
      SELECT *
      FROM platform_invites
      WHERE token_hash = $1
      FOR UPDATE
      `, [tokenHash]);
        if (inviteResult.rows.length === 0) {
            throw new errorHandler_1.NotFoundError("Invite not found");
        }
        const invite = inviteResult.rows[0];
        if (invite.accepted_at) {
            throw new errorHandler_1.ForbiddenError("Invite already accepted");
        }
        if (invite.revoked_at) {
            throw new errorHandler_1.ForbiddenError("Invite revoked");
        }
        if (new Date(invite.expires_at) <
            new Date()) {
            throw new errorHandler_1.ForbiddenError("Invite expired");
        }
        const existingUser = await client.query(`
      SELECT id
      FROM users
      WHERE email = $1
      AND deleted_at IS NULL
      `, [invite.email]);
        if (existingUser.rows.length > 0) {
            throw new errorHandler_1.AppError("A user with this email already exists", 409, "EMAIL_ALREADY_EXISTS");
        }
        let userId;
        try {
            const userResult = await client.query(`
        INSERT INTO users
        (
          username,
          email,
          status
        )
        VALUES
        (
          $1,
          $2,
          'ACTIVE'
        )
        RETURNING id
        `, [
                username,
                invite.email,
            ]);
            userId = userResult.rows[0].id;
        }
        catch (err) {
            (0, auth_service_1.handlePgError)(err);
        }
        await client.query(`
      INSERT INTO user_profiles
      (
        user_id,
        first_name,
        last_name,
        phone,
        linkedin_url,
        avatar_url
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
      `, [
            userId,
            first_name,
            last_name ?? null,
            phone ?? null,
            linkedin_url ?? null,
            avatar_url ?? null,
        ]);
        const passwordHash = await bcrypt_1.default.hash(password, 12);
        await client.query(`
      INSERT INTO auth_accounts
      (
        user_id,
        provider,
        password_hash,
        last_login_at
      )
      VALUES
      (
        $1,
        'PASSWORD',
        $2,
        NOW()
      )
      `, [
            userId,
            passwordHash,
        ]);
        await client.query(`
      UPDATE platform_invites
      SET
        accepted_at = NOW(),
        accepted_by = $1
      WHERE id = $2
      `, [
            userId,
            invite.id,
        ]);
        const refreshToken = (0, auth_service_1.generateRefreshToken)();
        const refreshTokenHash = (0, auth_service_1.hashRefreshToken)(refreshToken);
        const sessionResult = await client.query(`
      INSERT INTO user_sessions
      (
        user_id,
        refresh_token_hash,
        user_agent,
        ip_address,
        device_name,
        platform,
        browser,
        expires_at
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )
      RETURNING id
      `, [
            userId,
            refreshTokenHash,
            meta.user_agent ?? null,
            meta.ip_address ?? null,
            meta.device_name ?? null,
            meta.platform ?? null,
            meta.browser ?? null,
            (0, auth_service_1.getRefreshTokenExpiry)(),
        ]);
        const sessionId = sessionResult.rows[0].id;
        const accessToken = (0, auth_service_1.generateAccessToken)(userId, sessionId);
        return {
            userId,
            email: invite.email,
            tokens: {
                accessToken,
                refreshToken,
            },
        };
    });
}
//# sourceMappingURL=invites.accept.service.js.map