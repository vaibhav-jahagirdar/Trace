import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireMembership } from "../../middleware/requireMembership";
import { validateParams } from "../../middleware/validateParams";
import { orgIdParamSchema } from "./orgs.validator";
import { createOrganizationHandler, getOrganizationHandler } from "./controller/orgs.controller";

const router = Router();

router.post("/", requireAuth, createOrganizationHandler);

router.get(
  "/:orgId",
  requireAuth,
  validateParams(orgIdParamSchema),
  requireMembership,
  getOrganizationHandler,
);

export default router;