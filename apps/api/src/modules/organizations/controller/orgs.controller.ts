import type { Request, Response } from "express";
import { createOrganizationSchema } from "../orgs.validator";
import { createOrganization } from "../services/orgs.create.service";
import { fetchOrganizationInfo } from "../services/orgs.fetch.service";
import { asyncHandler } from "../../../middleware/asyncHandler";
import { UnauthorizedError, ValidationError } from "../../../middleware/errorHandler";

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