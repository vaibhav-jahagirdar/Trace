import type { Request, Response } from "express";

import { asyncHandler } from "../../middleware/asyncHandler";
import {
  ValidationError,
  UnauthorizedError,
} from "../../middleware/errorHandler";

import {
  logout as logoutUser,
  logoutAll as logoutAllUser,
} from "./auth.logout.service";

import { IS_PRODUCTION } from "./auth.controller";

function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    path: "/auth/refresh",
  });
}

export const logout = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken =
      req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new ValidationError(
        "Refresh token is required"
      );
    }

    if (!req.user?.id) {
      throw new UnauthorizedError(
        "Unauthorized"
      );
    }

    await logoutUser(
      { refreshToken },
      req.user.id
    );

    clearAuthCookies(res);

    res.status(200).json({
      message:
        "Logged out successfully",
    });
  }
);

export const logoutAll = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new UnauthorizedError(
        "Unauthorized"
      );
    }

    const { revokedCount } =
      await logoutAllUser(
        req.user.id
      );

    clearAuthCookies(res);

    res.status(200).json({
      message:
        "Logged out from all devices successfully",
      data: {
        revokedCount,
      },
    });
  }
);