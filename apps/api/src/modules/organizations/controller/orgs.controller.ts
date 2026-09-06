import type { Request, Response } from "express";
import { createOrganizationSchema, updateOrganizationSchema, organizationDeletionSchema } from "../orgs.validator";
import { createOrganization } from "../services/orgs.create.service";
import { fetchOrganizationInfo } from "../services/orgs.fetch.service";
import { asyncHandler } from "../../../middleware/asyncHandler";
import { UnauthorizedError, ValidationError } from "../../../middleware/errorHandler";
import { updateOrganization, requestOrganizationDeletion, cancelOrganizationDeletion } from "../services/orgs.manage.service";
import { listOrganizationMembers, updateMemberRole, removeMember, addExistingMember, type ManageableOrgRole } from "../services/members.manage.service";
import { updateMemberRoleSchema, addMemberSchema, ownershipTransferSchema } from "../orgs.validator";
import { requestOwnershipTransfer, cancelOwnershipTransfer } from "../services/orgs.manage.service";

export const createOrganizationHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  const data = createOrganizationSchema.parse(req.body);
  const result = await createOrganization(data, userId);

  res.status(201).json({
    message: "Organization created successfully",
    data: result,
  });
});

export const updateOrganizationHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { orgId } = req.params;
  if (!userId || !orgId || Array.isArray(orgId)) throw new UnauthorizedError("Unauthorized");
  const result = await updateOrganization(orgId, userId, updateOrganizationSchema.parse(req.body));
  res.json({ message: "Organization updated successfully", data: result });
});

export const requestOrganizationDeletionHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { orgId } = req.params;
  if (!userId || !orgId || Array.isArray(orgId)) throw new UnauthorizedError("Unauthorized");
  const input = organizationDeletionSchema.parse(req.body);
  const result = await requestOrganizationDeletion(orgId, userId, input.password, input.securityAnswer);
  res.status(202).json({ message: "Organization deletion scheduled", data: result });
});

export const cancelOrganizationDeletionHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { orgId } = req.params;
  if (!userId || !orgId || Array.isArray(orgId)) throw new UnauthorizedError("Unauthorized");
  const result = await cancelOrganizationDeletion(orgId, userId);
  res.json({ message: "Organization deletion cancelled", data: result });
});

export const listOrganizationMembersHandler = asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  if (!orgId || Array.isArray(orgId)) throw new ValidationError("Invalid organization id");
  res.json({ data: await listOrganizationMembers(orgId) });
});

export const updateMemberRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { orgId, membershipId } = req.params;
  if (!userId || !orgId || Array.isArray(orgId) || !membershipId || Array.isArray(membershipId)) throw new UnauthorizedError("Unauthorized");
  const { role } = updateMemberRoleSchema.parse(req.body);
  res.json({ message: "Member role updated", data: await updateMemberRole(orgId, userId, membershipId, role as ManageableOrgRole) });
});

export const removeMemberHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { orgId, membershipId } = req.params;
  if (!userId || !orgId || Array.isArray(orgId) || !membershipId || Array.isArray(membershipId)) throw new UnauthorizedError("Unauthorized");
  res.json({ message: "Member removed", data: await removeMember(orgId, userId, membershipId) });
});

export const addMemberHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { orgId } = req.params;
  if (!userId || !orgId || Array.isArray(orgId)) throw new UnauthorizedError("Unauthorized");
  const input = addMemberSchema.parse(req.body);
  res.status(201).json({ message: "Member added", data: await addExistingMember(orgId, userId, input.email, input.role as ManageableOrgRole) });
});

export const requestOwnershipTransferHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { orgId } = req.params;
  if (!userId || !orgId || Array.isArray(orgId)) throw new UnauthorizedError("Unauthorized");
  const input = ownershipTransferSchema.parse(req.body);
  res.status(202).json({ message: "Ownership transfer scheduled", data: await requestOwnershipTransfer(orgId, userId, input.targetMembershipId, input.password) });
});

export const cancelOwnershipTransferHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { orgId } = req.params;
  if (!userId || !orgId || Array.isArray(orgId)) throw new UnauthorizedError("Unauthorized");
  res.json({ message: "Ownership transfer cancelled", data: await cancelOwnershipTransfer(orgId, userId) });
});

export const getOrganizationHandler = asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;

  if (!orgId || Array.isArray(orgId)) {
    throw new ValidationError("Invalid organization id");
  }

  const organization = await fetchOrganizationInfo(orgId);

  res.status(200).json({
    message: "Organization fetched successfully",
    data: organization,
  });
});
