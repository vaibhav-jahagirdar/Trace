import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireMembership } from "../../middleware/requireMembership";
import { validateParams } from "../../middleware/validateParams";
import {
  createJobController,
  publishJobController,
  getJobPreviewController,
  getJobController
} from "./jobs.controller";
import { getJobDraftController } from "./jobs.controller";
import { saveJobDraftController } from "./jobs.controller";
import { orgIdParamSchema } from "../organizations/orgs.validator";

const router = Router({ mergeParams: true });

router.post(
  "/",
  requireAuth,
  requireMembership(),
  validateParams(orgIdParamSchema),
  createJobController,
);

router.post(
  "/:jobId/publish",
  requireAuth,
  requireMembership(),
  validateParams(orgIdParamSchema),
  publishJobController,
);
router.get(
  "/:jobId/publish-preview",
  requireAuth,
  requireMembership(),
  getJobPreviewController,
);
router.get("/draft", requireAuth, requireMembership(), validateParams(orgIdParamSchema), getJobDraftController);
router.put("/draft", requireAuth, requireMembership(), validateParams(orgIdParamSchema), saveJobDraftController);
router.get("/:jobId", getJobController);
export default router;   
