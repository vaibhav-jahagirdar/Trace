import { Router } from "express";

import { uploadResume } from "../../../middleware/upload";
import {
  applyJobController,
  applyPublicJobController,
  getPublicJobController,
} from "./jobs.apply.controller";
import { validateParams } from "../../../middleware/validateParams";
import {
  applyJobParamsSchema,
  publicApplyJobParamsSchema,
} from "./validator";

const router = Router();

router.post(
  "/jobs/:jobId/applications",
  validateParams(applyJobParamsSchema),
  uploadResume,
  applyJobController,
);

router.get(
  "/public/organizations/:orgSlug/jobs/:jobSlug",
  validateParams(publicApplyJobParamsSchema),
  getPublicJobController,
);

router.post(
  "/public/organizations/:orgSlug/jobs/:jobSlug/applications",
  validateParams(publicApplyJobParamsSchema),
  uploadResume,
  applyPublicJobController,
);

export default router;
