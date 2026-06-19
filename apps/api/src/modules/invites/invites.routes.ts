import { Router } from "express";

import {
  createPlatformInvite,
  validatePlatformInvite,
  acceptPlatformInvite,
} from "./invites.controller";

import { requireAuth } from "../../middleware/requireAuth";

const router = Router();

router.post(
  "/",
  requireAuth,

  createPlatformInvite,
);

router.get("/validate", validatePlatformInvite);


router.post("/accept", acceptPlatformInvite);

export default router;
