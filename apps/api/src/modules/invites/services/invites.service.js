"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvite = createInvite;
exports.sendPlatformInviteEmail = sendPlatformInviteEmail;
const transaction_1 = require("../../../config/transaction");
const auth_service_1 = require("../../auth/auth.service");
const errorHandler_1 = require("../../../middleware/errorHandler");
const logger_1 = require("../../../lib/logger");
const resend_1 = require("resend");
const log = logger_1.logger.child({ module: "invites" });
async function createInvite(data, userId) {
    return (0, transaction_1.withTransaction)(async (client) => {
        const { email } = data;
        log.info({ userId, email }, "invite creation requested");
        const adminResult = await client.query(`
      SELECT id
      FROM users
      WHERE id = $1
        AND is_platform_admin = true
        AND suspended_at IS NULL
        AND deleted_at IS NULL
      `, [userId]);
        if (adminResult.rows.length === 0) {
            log.warn({ userId }, "non-admin attempted to create invite");
            throw new errorHandler_1.ForbiddenError("Only platform admins can create invites");
        }
        const existingUserResult = await client.query(`
      SELECT id
      FROM users
      WHERE email = $1
        AND deleted_at IS NULL
      `, [email]);
        if (existingUserResult.rows.length > 0) {
            log.info({ email }, "invite creation skipped, user already exists");
            throw new errorHandler_1.AppError("A user with this email already exists", 409, "EMAIL_ALREADY_EXISTS");
        }
        const existingInviteResult = await client.query(`
      SELECT id
      FROM platform_invites
      WHERE email = $1
        AND accepted_at IS NULL
        AND revoked_at IS NULL
        AND expires_at > NOW()
      `, [email]);
        if (existingInviteResult.rows.length > 0) {
            log.info({ email }, "invite creation skipped, active invite already exists");
            throw new errorHandler_1.AppError("An active invite already exists for this email", 409, "ACTIVE_INVITE_EXISTS");
        }
        const token = (0, auth_service_1.generateRefreshToken)();
        const tokenHash = (0, auth_service_1.hashRefreshToken)(token);
        const expiresAt = (0, auth_service_1.getRefreshTokenExpiry)();
        const inviteResult = await client.query(`
      INSERT INTO platform_invites
      (
        email,
        token_hash,
        expires_at,
        created_by
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING id
      `, [email, tokenHash, expiresAt, userId]);
        const inviteId = inviteResult.rows[0].id;
        log.info({ inviteId, email, expiresAt }, "invite created");
        return {
            inviteId,
            email,
            token,
            expiresAt,
        };
    });
}
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
}
const resend = new resend_1.Resend(apiKey);
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
async function sendPlatformInviteEmail(email, token) {
    const inviteUrl = `${APP_URL}/accept-invite?token=${token}`;
    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: "You've been invited to Trace",
            html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Welcome to Trace</h2>
          <p>You have been invited to join Trace.</p>
          <p>Click the button below to create your account.</p>
          <p>
            
              href="${inviteUrl}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#111827;
                color:white;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Accept Invite
            </a>
          </p>
          <p>Or copy this URL:</p>
          <p>${inviteUrl}</p>
          <p>This invite expires in 7 days.</p>
        </div>
      `,
        });
        log.info({ email }, "invite email sent");
    }
    catch (error) {
        log.error({ err: error, email }, "failed to send invite email");
        throw new errorHandler_1.AppError("Failed to send invite email", 500, "EMAIL_SEND_FAILED");
    }
}
//# sourceMappingURL=invites.service.js.map