"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInvite = validateInvite;
const db_1 = require("../../../config/db");
const errorHandler_1 = require("../../../middleware/errorHandler");
const auth_service_1 = require("../../auth/auth.service");
async function validateInvite(token) {
    const tokenHash = (0, auth_service_1.hashRefreshToken)(token);
    const { rows } = await (0, db_1.getDb)().query(`
    SELECT
      id,
      email,
      expires_at
    FROM platform_invites
    WHERE token_hash = $1
      AND accepted_at IS NULL
      AND revoked_at IS NULL
    `, [tokenHash]);
    if (rows.length === 0) {
        throw new errorHandler_1.NotFoundError("Invite not found");
    }
    const invite = rows[0];
    if (new Date(invite.expires_at) <
        new Date()) {
        throw new errorHandler_1.ForbiddenError("Invite has expired");
    }
    return {
        email: invite.email,
        expiresAt: invite.expires_at,
    };
}
//# sourceMappingURL=invites.validate.service.js.map