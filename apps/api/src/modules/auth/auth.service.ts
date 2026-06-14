import type { RegisterInput, LoginInput } from "./auth.validator";
import type { SessionMeta, AuthResult, AuthTokens } from "./auth.types";
import { withTransaction } from "../../config/transaction";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
} from "../../middleware/errorHandler";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

const JWT_EXPIRY = process.env.JWT_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY_DAYS =
  Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS) || 7;

if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

export function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET!, { expiresIn: "15m" });
  const refreshToken = crypto.randomBytes(64).toString("hex");
  return { accessToken, refreshToken };
}

export function hashRefreshToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getRefreshTokenExpiry() {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
}

function handlePgError(err: any): never {
  if (err.code === "23505") {
    if (err.constraint === "users_email_key")
      throw new AppError("Email already in use", 409, "EMAIL_TAKEN");
    if (err.constraint === "users_username_key")
      throw new AppError("Username already taken", 409, "USERNAME_TAKEN");
  }
  throw err;
}

export async function registerUser(
  data: RegisterInput,
  meta: SessionMeta,
): Promise<AuthResult> {
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    phone,
    linkedin_url,
    avatar_url,
  } = data;

  return withTransaction(async (client) => {
    let userId: string;

    try {
      const { rows } = await client.query(
        `INSERT INTO users (username, email, status) VALUES ($1, $2, 'ACTIVE') RETURNING id`,
        [username, email],
      );
      userId = rows[0]?.id;
      if (!userId)
        throw new AppError(
          "Failed to create user",
          500,
          "USER_CREATION_FAILED",
        );
    } catch (err) {
      handlePgError(err);
    }

    await client.query(
      `INSERT INTO user_profiles (user_id, first_name, last_name, phone, linkedin_url, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId!,
        first_name,
        last_name ?? null,
        phone ?? null,
        linkedin_url ?? null,
        avatar_url ?? null,
      ],
    );

    const password_hash = await bcrypt.hash(password, 12);
    await client.query(
      `INSERT INTO auth_accounts (user_id, provider, password_hash, last_login_at)
       VALUES ($1, 'PASSWORD', $2, NOW())`,
      [userId!, password_hash],
    );

    const { accessToken, refreshToken } = generateTokens(userId!);
    const refreshTokenHash = hashRefreshToken(refreshToken);

    await client.query(
      `INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_address, device_name, platform, browser, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId!,
        refreshTokenHash,
        meta.user_agent ?? null,
        meta.ip_address ?? null,
        meta.device_name ?? null,
        meta.platform ?? null,
        meta.browser ?? null,
        getRefreshTokenExpiry(),
      ],
    );

    return { userId: userId!, tokens: { accessToken, refreshToken } };
  });
}

export async function loginUser(data: LoginInput, meta: SessionMeta) {
  return withTransaction(async (client) => {
    const { email, password } = data;

    const { rows } = await client.query(
      `SELECT u.id, u.username, a.password_hash, a.failed_login_attempts, a.locked_until
       FROM users u
       JOIN auth_accounts a ON u.id = a.user_id
       WHERE u.email = $1
AND a.provider = 'PASSWORD'
AND u.status = 'ACTIVE'
AND u.deleted_at IS NULL
AND u.suspended_at IS NULL`,
      [email],
    );

    if (rows.length === 0) throw new UnauthorizedError("Invalid credentials");

    const user = rows[0];

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new AppError("Account temporarily locked", 423, "ACCOUNT_LOCKED");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await client.query(
  `
  UPDATE auth_accounts
  SET
      failed_login_attempts =
          failed_login_attempts + 1,

      locked_until =
          CASE
              WHEN failed_login_attempts + 1 >= 5
              THEN NOW() + INTERVAL '15 minutes'
              ELSE locked_until
          END
  WHERE user_id = $1
  `,
  [user.id]
);
      throw new UnauthorizedError("Invalid credentials");
    }

    await client.query(
      `UPDATE auth_accounts SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE user_id = $1`,
      [user.id],
    );

    const { accessToken, refreshToken } = generateTokens(user.id);
    const refreshTokenHash = hashRefreshToken(refreshToken);

    await client.query(
      `INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_address, device_name, platform, browser, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        user.id,
        refreshTokenHash,
        meta.user_agent ?? null,
        meta.ip_address ?? null,
        meta.device_name ?? null,
        meta.platform ?? null,
        meta.browser ?? null,
        getRefreshTokenExpiry(),
      ],
    );

    return {
      userId: user.id,
      userName: user.username,
      tokens: { accessToken, refreshToken },
    };
  });
}
