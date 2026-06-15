import { AuthTokens } from "./auth.types";
import { withTransaction } from "../../config/transaction";
import { hashRefreshToken } from "./auth.service";
import { UnauthorizedError } from "../../middleware/errorHandler";





export async function logout(
  data: Pick<AuthTokens, "refreshToken">,
  userId: string,
) {
  return withTransaction(async (client) => {
    if (!data.refreshToken) {
      throw new UnauthorizedError("Refresh token required");
    }

    const hashedRefreshToken = hashRefreshToken(data.refreshToken);

    const tokenResult = await client.query(
      `
      SELECT id, user_id, revoked_at
      FROM user_sessions
      WHERE refresh_token_hash = $1
        AND user_id = $2
        AND expires_at > NOW()
      FOR UPDATE
      `,
      [hashedRefreshToken, userId],
    );

    if (tokenResult.rows.length === 0) {
      throw new UnauthorizedError("Invalid session");
    }

    const { revoked_at: revokedAt } = tokenResult.rows[0];

    if (revokedAt !== null) {
      throw new UnauthorizedError("Session already revoked");
    }

    await client.query(
      `
      UPDATE user_sessions
      SET
        revoked_at = NOW(),
        revoked_reason = 'LOGOUT'
      WHERE refresh_token_hash = $1
        AND user_id = $2
      `,
      [hashedRefreshToken, userId],
    );
  });
}

export async function logoutAll(userId: string) {
  return withTransaction(async (client) => {
    const result = await client.query(
      `
      UPDATE user_sessions
      SET
        revoked_at = NOW(),
        revoked_reason = 'LOGOUT_ALL'
      WHERE user_id = $1
        AND revoked_at IS NULL
      RETURNING id
      `,
      [userId],
    );

    if (result.rowCount === 0) {
      throw new UnauthorizedError("No active sessions found");
    }

    return { revokedCount: result.rowCount };
  });
}