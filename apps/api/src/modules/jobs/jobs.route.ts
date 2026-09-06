import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireMembership } from "../../middleware/requireMembership";
import { validateParams } from "../../middleware/validateParams";
import {
  createJobController,
  publishJobController,
  getJobPreviewController,
  getJobController,
  listJobsController,
  getJobControlRoomController,
  getJobApplicationAnalysisReportsController,
  getJobApplicationResumeController,
  updateJobController, transitionJobController, deleteJobController,
} from "./jobs.controller";
import { getJobDraftController } from "./jobs.controller";
import { saveJobDraftController } from "./jobs.controller";
import { orgIdParamSchema, orgJobIdParamSchema } from "../organizations/orgs.validator";
import { manuallyPlanRepositoryController } from "./repositoryPlanner.controller";

const router = Router({ mergeParams: true });

router.post(
  "/",
  requireAuth,
  requireMembership("RECRUITER"),
  validateParams(orgIdParamSchema),
  createJobController,
);
router.patch("/:jobId", requireAuth, requireMembership("RECRUITER"), validateParams(orgJobIdParamSchema), updateJobController);
router.post("/:jobId/status", requireAuth, requireMembership("RECRUITER"), validateParams(orgJobIdParamSchema), transitionJobController);
router.delete("/:jobId", requireAuth, requireMembership("RECRUITER"), validateParams(orgJobIdParamSchema), deleteJobController);

router.post(
  "/:jobId/publish",
  requireAuth,
  requireMembership("RECRUITER"),
  validateParams(orgJobIdParamSchema),
  publishJobController,
);
router.get(
  "/:jobId/publish-preview",
  requireAuth,
  requireMembership(),
  validateParams(orgJobIdParamSchema),
  getJobPreviewController,
);
router.get("/draft", requireAuth, requireMembership("RECRUITER"), validateParams(orgIdParamSchema), getJobDraftController);
router.put("/draft", requireAuth, requireMembership("RECRUITER"), validateParams(orgIdParamSchema), saveJobDraftController);
router.get(
  "/",
  requireAuth,
  requireMembership(),
  validateParams(orgIdParamSchema),
  listJobsController,
);
router.get(
  "/:jobId/control-room",
  requireAuth,
  requireMembership(),
  validateParams(orgJobIdParamSchema),
  getJobControlRoomController,
);
router.get(
  "/:jobId/applications/:applicationId/analysis-reports",
  requireAuth,
  requireMembership(),
  validateParams(orgJobIdParamSchema.extend({ applicationId: orgJobIdParamSchema.shape.jobId })),
  getJobApplicationAnalysisReportsController,
);
router.get(
  "/:jobId/applications/:applicationId/resume",
  requireAuth,
  requireMembership(),
  validateParams(orgJobIdParamSchema.extend({ applicationId: orgJobIdParamSchema.shape.jobId })),
  getJobApplicationResumeController,
);
router.get("/:jobId", requireAuth, requireMembership(), validateParams(orgJobIdParamSchema), getJobController);
router.post(
  "/:jobId/applications/:applicationId/repository-plan",
  requireAuth,
  requireMembership("RECRUITER"),
  manuallyPlanRepositoryController,
);
export default router;   
