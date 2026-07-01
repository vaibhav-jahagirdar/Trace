import type { CreateInviteInput } from "../invites.validator";
import { withTransaction } from "../../../config/transaction";
import {
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiry,
} from "../../auth/auth.service";
import { AppError, ForbiddenError } from "../../../middleware/errorHandler";
import { logger } from "../../../lib/logger";
import { Resend } from "resend";

const log = logger.child({ module: "invites" });

type CreateInviteResult = {
  inviteId: string;
  email: string;
  token: string;
  expiresAt: Date;
};

export async function createInvite(
  data: CreateInviteInput,
  userId: string,
): Promise<CreateInviteResult> {
  return withTransaction(async (client) => {
    const { email } = data;

    log.info({ userId, email }, "invite creation requested");

    const adminResult = await client.query(
      `
      SELECT id
      FROM users
      WHERE id = $1
        AND is_platform_admin = true
        AND suspended_at IS NULL
        AND deleted_at IS NULL
      `,
      [userId],
    );

    if (adminResult.rows.length === 0) {
      log.warn({ userId }, "non-admin attempted to create invite");
      throw new ForbiddenError("Only platform admins can create invites");
    }

    const existingUserResult = await client.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
        AND deleted_at IS NULL
      `,
      [email],
    );

    if (existingUserResult.rows.length > 0) {
      log.info({ email }, "invite creation skipped, user already exists");
      throw new AppError(
        "A user with this email already exists",
        409,
        "EMAIL_ALREADY_EXISTS",
      );
    }

    const existingInviteResult = await client.query(
      `
      SELECT id
      FROM platform_invites
      WHERE email = $1
        AND accepted_at IS NULL
        AND revoked_at IS NULL
        AND expires_at > NOW()
      `,
      [email],
    );

    if (existingInviteResult.rows.length > 0) {
      log.info({ email }, "invite creation skipped, active invite already exists");
      throw new AppError(
        "An active invite already exists for this email",
        409,
        "ACTIVE_INVITE_EXISTS",
      );
    }

    const token = generateRefreshToken();
    const tokenHash = hashRefreshToken(token);
    const expiresAt = getRefreshTokenExpiry();

    const inviteResult = await client.query(
      `
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
      `,
      [email, tokenHash, expiresAt, userId],
    );

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

const resend = new Resend(apiKey);

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

export async function sendPlatformInviteEmail(
  email: string,
  token: string,
): Promise<void> {
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
  } catch (error) {
    log.error({ err: error, email }, "failed to send invite email");
    throw new AppError("Failed to send invite email", 500, "EMAIL_SEND_FAILED");
  }
}