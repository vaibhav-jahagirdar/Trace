import type { Request, Response } from "express";

import { asyncHandler } from "../../middleware/asyncHandler";

import {
  createInviteSchema,
  acceptInviteSchema,
} from "./invites.validator";
import { ValidationError } from "../../middleware/errorHandler";

import { CreateInviteInput } from "./invites.validator";
import { validateInvite } from "./services/invites.validate.service";
import { AcceptInviteInput } from "./invites.validator";
import { acceptInvite } from "./services/invites.accept.service";

import {
  extractSessionMeta,
  setAuthCookies,
} from "../auth/auth.controller";
import { createInvite } from "./services/invites.service";

export const createPlatformInvite = asyncHandler(
  async (req: Request, res: Response) => {
    const data = createInviteSchema.parse(
      req.body
    );

    const userId = req.user?.id
    if(!userId) {
        throw new ValidationError("User ID is required to create an invite");

    }

    const invite = await createInvite(
      data,
      userId
    );

    res.status(201).json({
      message:
        "Platform invite created successfully",
      data: {
        inviteId: invite.inviteId,
        email: invite.email,
        expiresAt: invite.expiresAt,
      },
    });
  }
);

export const validatePlatformInvite =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const token =
        req.query.token as string;

      const invite =
        await validateInvite(token);

      res.status(200).json({
        message:
          "Invite validated successfully",
        data: invite,
      });
    }
  );

export const acceptPlatformInvite =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const data =
        acceptInviteSchema.parse(
          req.body
        );

      const meta =
        extractSessionMeta(req);

      const result =
        await acceptInvite(
          data,
          meta
        );

      setAuthCookies(
        res,
        result.tokens.accessToken,
        result.tokens.refreshToken
      );

      res.status(201).json({
        message:
          "Invite accepted successfully",
        data: {
          userId: result.userId,
          email: result.email,
        },
      });
    }
  );