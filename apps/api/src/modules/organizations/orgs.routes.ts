import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireMembership } from "../../middleware/requireMembership";
import { validateParams } from "../../middleware/validateParams";
import { orgIdParamSchema, membershipIdParamSchema } from "./orgs.validator";
import { createOrganizationHandler, getOrganizationHandler, updateOrganizationHandler, requestOrganizationDeletionHandler, cancelOrganizationDeletionHandler } from "./controller/orgs.controller";
import { getOrganizationDashboardController } from "../jobs/jobs.controller";
import { OrgRole } from "./orgs.types";
import { listOrganizationMembersHandler, updateMemberRoleHandler, removeMemberHandler, addMemberHandler, requestOwnershipTransferHandler, cancelOwnershipTransferHandler } from "./controller/orgs.controller";

const router = Router();

router.post("/", requireAuth, createOrganizationHandler);

router.get(
  "/:orgId",
  requireAuth,
  validateParams(orgIdParamSchema),
  requireMembership(),
  getOrganizationHandler,
);
router.get("/:orgId/members", requireAuth, validateParams(orgIdParamSchema), requireMembership(), listOrganizationMembersHandler);
router.post("/:orgId/members", requireAuth, validateParams(orgIdParamSchema), requireMembership(), addMemberHandler);
router.post("/:orgId/ownership-transfer", requireAuth, validateParams(orgIdParamSchema), requireMembership(OrgRole.OWNER), requestOwnershipTransferHandler);
router.post("/:orgId/ownership-transfer/cancel", requireAuth, validateParams(orgIdParamSchema), requireMembership(OrgRole.OWNER), cancelOwnershipTransferHandler);
router.patch("/:orgId/members/:membershipId", requireAuth, validateParams(membershipIdParamSchema), requireMembership(), updateMemberRoleHandler);
router.delete("/:orgId/members/:membershipId", requireAuth, validateParams(membershipIdParamSchema), requireMembership(), removeMemberHandler);
router.patch("/:orgId", requireAuth, validateParams(orgIdParamSchema), requireMembership(OrgRole.OWNER), updateOrganizationHandler);
router.post("/:orgId/deletion-request", requireAuth, validateParams(orgIdParamSchema), requireMembership(OrgRole.OWNER), requestOrganizationDeletionHandler);
router.delete("/:orgId", requireAuth, validateParams(orgIdParamSchema), requireMembership(OrgRole.OWNER), requestOrganizationDeletionHandler);
router.post("/:orgId/deletion-cancel", requireAuth, validateParams(orgIdParamSchema), requireMembership(OrgRole.OWNER), cancelOrganizationDeletionHandler);
router.get(
  "/:orgId/dashboard",
  requireAuth,
  validateParams(orgIdParamSchema),
  requireMembership(),
  getOrganizationDashboardController,
);

export default router;
