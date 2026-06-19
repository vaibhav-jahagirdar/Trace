import { getDb } from "../../../config/db";
import { ForbiddenError, NotFoundError } from "../../../middleware/errorHandler";
import { hashRefreshToken } from "../../auth/auth.service";

export async function validateInvite(
  token: string
) {
  const tokenHash =
    hashRefreshToken(token);

  const { rows } = await getDb().query(
    `
    SELECT
      id,
      email,
      expires_at
    FROM platform_invites
    WHERE token_hash = $1
      AND accepted_at IS NULL
      AND revoked_at IS NULL
    `,
    [tokenHash]
  );

  if (rows.length === 0) {
    throw new NotFoundError(
      "Invite not found"
    );
  }

  const invite = rows[0];

  if (
    new Date(invite.expires_at) <
    new Date()
  ) {
    throw new ForbiddenError(
      "Invite has expired"
    );
  }

  return {
    email: invite.email,
    expiresAt: invite.expires_at,
  };
}