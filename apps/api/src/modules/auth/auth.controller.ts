import type { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.validator";
import { registerUser, loginUser } from "./auth.service";
import { asyncHandler } from "../../middleware/asyncHandler";
import { UAParser } from "ua-parser-js";

const REFRESH_TOKEN_EXPIRY_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS) || 7;
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export function extractSessionMeta(req: Request) {
  const ua = UAParser(req.headers["user-agent"] ?? "");
  return {
    ip_address: req.ip ?? null,
    user_agent: req.headers["user-agent"] ?? null,
    device_name: ua.device.model ?? null,
    platform: ua.os.name ?? null,
    browser: ua.browser.name ?? null,
  };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: "/auth/refresh",
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const meta = extractSessionMeta(req);
  const { userId, tokens } = await registerUser(data, meta);

  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  res.status(201).json({
    message: "Account created successfully",
    data: { userId },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const meta = extractSessionMeta(req);
  const { userId, tokens } = await loginUser(data, meta);

  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  res.status(200).json({
    message: "Login successful",
    data: { userId },
  });
});