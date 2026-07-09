import { Router } from "express";

import { uploadResume } from "../../../middleware/upload";
import { applyJobController } from "./jobs.apply.controller";
import { validateParams } from "../../../middleware/validateParams";

const router = Router();

router.post(
  "/jobs/:jobId/applications",
  validateParams,
  uploadResume,
  applyJobController,
);

export default router;
