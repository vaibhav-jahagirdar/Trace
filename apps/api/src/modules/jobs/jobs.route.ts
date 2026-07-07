import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireMembership } from "../../middleware/requireMembership";
import { validateParams } from "../../middleware/validateParams";
import {
  createJobController,
  publishJobController,
} from "./jobs.controller";

const router = Router({ mergeParams: true });

router.post(
  "/",
  requireAuth,
  requireMembership,
  validateParams,
  createJobController,
);

router.post(
  "/:jobId/publish",
    requireAuth,
    requireMembership,
    validateParams,
  publishJobController,
);

export default router;