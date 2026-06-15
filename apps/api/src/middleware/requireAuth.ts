import jwt from "jsonwebtoken";
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { getDb } from "../config/db";

import {
  UnauthorizedError,
} from "./errorHandler";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not configured"
  );
}

type AccessTokenPayload = {
  userId: string;
  sessionId: string;
};

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const accessToken =
      req.cookies?.accessToken;

    if (!accessToken) {
      throw new UnauthorizedError(
        "Authentication required"
      );
    }

    const payload = jwt.verify(
      accessToken,
      JWT_SECRET!
    );

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("userId" in payload) ||
      !("sessionId" in payload)
    ) {
      throw new UnauthorizedError(
        "Invalid token"
      );
    }

    const {
      userId,
      sessionId,
    } = payload as AccessTokenPayload;

    const sessionResult =
      await getDb().query(
        `
        SELECT id
        FROM user_sessions
        WHERE id = $1
          AND user_id = $2
          AND revoked_at IS NULL
          AND expires_at > NOW()
        `,
        [
          sessionId,
          userId,
        ]
      );

    if (
      sessionResult.rows.length === 0
    ) {
      throw new UnauthorizedError(
        "Session expired"
      );
    }

    req.user = {
      id: userId,
      sessionId,
    };

    next();
  } catch (error) {
    next(
      new UnauthorizedError(
        "Invalid session"
      )
    );
  }
}