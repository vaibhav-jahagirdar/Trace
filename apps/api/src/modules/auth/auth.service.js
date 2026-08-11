"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = void 0;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.hashRefreshToken = hashRefreshToken;
exports.getRefreshTokenExpiry = getRefreshTokenExpiry;
exports.handlePgError = handlePgError;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getUserWithOrgs = getUserWithOrgs;
const transaction_1 = require("../../config/transaction");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const errorHandler_1 = require("../../middleware/errorHandler");
const db_1 = require("../../config/db");
db_1.getDb;
exports.JWT_SECRET = process.env.JWT_SECRET;
if (!exports.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
}
const JWT_EXPIRY = process.env.JWT_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS) || 7;
if (!exports.JWT_SECRET)
    throw new Error("JWT_SECRET is not set");
function generateAccessToken(userId, sessionId) {
    return jsonwebtoken_1.default.sign({
        userId,
        sessionId,
    }, exports.JWT_SECRET, {
        expiresIn: "15m",
    });
}
function generateRefreshToken() {
    return crypto_1.default.randomBytes(64).toString("hex");
}
function hashRefreshToken(token) {
    return crypto_1.default
        .createHash("sha256")
        .update(token)
        .digest("hex");
}
function getRefreshTokenExpiry() {
    return new Date(Date.now() +
        REFRESH_TOKEN_EXPIRY_DAYS *
            24 *
            60 *
            60 *
            1000);
}
function handlePgError(err) {
    if (err.code === "23505") {
        if (err.constraint === "users_email_key")
            throw new errorHandler_1.AppError("Email already in use", 409, "EMAIL_TAKEN");
        if (err.constraint === "users_username_key")
            throw new errorHandler_1.AppError("Username already taken", 409, "USERNAME_TAKEN");
        if (err.constraint === "organizations_slug_key")
            throw new errorHandler_1.AppError("Slug already taken", 409, "SLUG_TAKEN");
    }
    throw err;
}
async function registerUser(data, meta) {
    const { username, email, password, first_name, last_name, phone, linkedin_url, avatar_url, } = data;
    return (0, transaction_1.withTransaction)(async (client) => {
        let userId;
        try {
            const { rows } = await client.query(`INSERT INTO users (username, email, status) VALUES ($1, $2, 'ACTIVE') RETURNING id`, [username, email]);
            userId = rows[0]?.id;
            if (!userId)
                throw new errorHandler_1.AppError("Failed to create user", 500, "USER_CREATION_FAILED");
        }
        catch (err) {
            handlePgError(err);
        }
        await client.query(`INSERT INTO user_profiles (user_id, first_name, last_name, phone, linkedin_url, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)`, [
            userId,
            first_name,
            last_name ?? null,
            phone ?? null,
            linkedin_url ?? null,
            avatar_url ?? null,
        ]);
        const password_hash = await bcrypt_1.default.hash(password, 12);
        await client.query(`INSERT INTO auth_accounts (user_id, provider, password_hash, last_login_at)
       VALUES ($1, 'PASSWORD', $2, NOW())`, [userId, password_hash]);
        const refreshToken = generateRefreshToken();
        const refreshTokenHash = hashRefreshToken(refreshToken);
        const sessionResult = await client.query(`INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_address, device_name, platform, browser, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`, [
            userId,
            refreshTokenHash,
            meta.user_agent ?? null,
            meta.ip_address ?? null,
            meta.device_name ?? null,
            meta.platform ?? null,
            meta.browser ?? null,
            getRefreshTokenExpiry(),
        ]);
        const sessionId = sessionResult.rows[0]?.id;
        const accessToken = generateAccessToken(userId, sessionId);
        return { userId: userId, tokens: { accessToken, refreshToken } };
    });
}
async function loginUser(data, meta) {
    return (0, transaction_1.withTransaction)(async (client) => {
        const { email, password } = data;
        const { rows } = await client.query(`SELECT u.id, u.username, a.password_hash, a.failed_login_attempts, a.locked_until
       FROM users u
       JOIN auth_accounts a ON u.id = a.user_id
       WHERE u.email = $1
AND a.provider = 'PASSWORD'
AND u.status = 'ACTIVE'
AND u.deleted_at IS NULL
AND u.suspended_at IS NULL`, [email]);
        if (rows.length === 0)
            throw new errorHandler_1.UnauthorizedError("Invalid credentials");
        const user = rows[0];
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            throw new errorHandler_1.AppError("Account temporarily locked", 423, "ACCOUNT_LOCKED");
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            await client.query(`
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
  `, [user.id]);
            throw new errorHandler_1.UnauthorizedError("Invalid credentials");
        }
        await client.query(`UPDATE auth_accounts SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE user_id = $1`, [user.id]);
        const refreshToken = generateRefreshToken();
        const refreshTokenHash = hashRefreshToken(refreshToken);
        const sessionResult = await client.query(`INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_address, device_name, platform, browser, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`, [
            user.id,
            refreshTokenHash,
            meta.user_agent ?? null,
            meta.ip_address ?? null,
            meta.device_name ?? null,
            meta.platform ?? null,
            meta.browser ?? null,
            getRefreshTokenExpiry(),
        ]);
        const sessionId = sessionResult.rows[0]?.id;
        const accessToken = generateAccessToken(user.id, sessionId);
        return {
            userId: user.id,
            userName: user.username,
            tokens: { accessToken, refreshToken },
        };
    });
}
async function getUserWithOrgs(userId) {
    const client = await (0, db_1.getDb)().connect();
    try {
        const { rows: userRows } = await client.query(`SELECT id, username, email, status, created_at, updated_at
       FROM users
       WHERE id = $1
         AND deleted_at IS NULL
         AND suspended_at IS NULL`, [userId]);
        if (userRows.length === 0)
            throw new errorHandler_1.NotFoundError("User not found");
        const user = userRows[0];
        const { rows: orgRows } = await client.query(`SELECT
         om.organization_id AS "orgId",
         o.slug          AS "orgSlug",
         o.name          AS "orgName",
         om.role         AS "role",
         om.title        AS "title",
         om.joined_at    AS "joinedAt"
       FROM organization_members om
       JOIN organizations o ON o.id = om.organization_id
       WHERE om.user_id = $1
         AND om.removed_at IS NULL
         AND o.deleted_at IS NULL
         AND o.status = 'ACTIVE'
       ORDER BY om.joined_at ASC`, [userId]);
        return {
            ...user,
            organizations: orgRows,
        };
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=auth.service.js.map