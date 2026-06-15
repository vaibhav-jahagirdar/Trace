import type { AuthTokens, SessionMeta } from "./auth.types";
import {
  getRefreshTokenExpiry,
  generateTokens,
  hashRefreshToken,
} from "./auth.service";

import { withTransaction } from "../../config/transaction";

import { AppError, UnauthorizedError } from "../../middleware/errorHandler";

export async function revokeRefreshToken(
  client: any,
  revokedReason: string,
  userId: string,
) {
  await client.query(
    `
    UPDATE user_sessions
    SET
      revoked_at = NOW(),
      revoked_reason = $1
    WHERE user_id = $2
      AND revoked_at IS NULL
    `,
    [revokedReason, userId],
  );
}

export async function refreshTokenRotation(
  data: Pick<AuthTokens, "refreshToken">,
  meta: SessionMeta,
) {
  return withTransaction(async (client) => {
    if (!data.refreshToken) {
      throw new UnauthorizedError("Refresh token required");
    }

    const hashedRefreshToken = hashRefreshToken(data.refreshToken);

    const tokenResult = await client.query(
      `
      SELECT
        id,
        user_id,
        revoked_at,
        revoked_reason
      FROM user_sessions
      WHERE refresh_token_hash = $1
        AND expires_at > NOW()
      FOR UPDATE
      `,
      [hashedRefreshToken],
    );

    if (tokenResult.rows.length === 0) {
      throw new UnauthorizedError("Invalid session");
    }

    const {
      id: oldSessionId,
      user_id: userId,
      revoked_at: revokedAt,
    } = tokenResult.rows[0];

    if (revokedAt !== null) {
      await revokeRefreshToken(client, "Refresh token reuse detected", userId);

      throw new UnauthorizedError(
        "Token reuse detected. All sessions revoked.",
      );
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      generateTokens(userId);

    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

    const expiresAt = getRefreshTokenExpiry();

    const newSessionResult = await client.query(
      `
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
        `,
      [
        userId,
        newRefreshTokenHash,
        oldSessionId,
        meta.user_agent ?? null,
        meta.ip_address ?? null,
        meta.device_name ?? null,
        meta.platform ?? null,
        meta.browser ?? null,
        expiresAt,
      ],
    );

    const newSessionId = newSessionResult.rows[0]?.id;

    if (!newSessionId) {
      throw new AppError(
        "Failed to create new session",
        500,
        "SESSION_CREATION_FAILED",
      );
    }

    await client.query(
      `
      UPDATE user_sessions
      SET
        revoked_at = NOW(),
        revoked_reason = 'ROTATED',
        last_used_at = NOW()
      WHERE id = $1
      `,
      [oldSessionId],
    );

    return {
      userId,
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  });
}
