import type { Request, Response } from "express";

import { asyncHandler } from "../../middleware/asyncHandler";
import { ValidationError } from "../../middleware/errorHandler";

import { refreshTokenRotation } from "./auth.refresh.service";
import { extractSessionMeta } from "./auth.controller";
import { setAuthCookies } from "./auth.controller";

export const refresh = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken =
      req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new ValidationError(
        "Refresh token is required"
      );
    }

    const meta = extractSessionMeta(req);

    const { userId, tokens } =
      await refreshTokenRotation(
        { refreshToken },
        meta
      );

    setAuthCookies(
      res,
      tokens.accessToken,
      tokens.refreshToken
    );

    res.status(200).json({
      message: "Token refreshed successfully",
      data: {
        userId,
      },
    });
  }
);