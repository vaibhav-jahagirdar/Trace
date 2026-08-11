import type { Request, Response } from "express";
ValidationError
import {
  listJobRoleCategories,
  getJobRoleCategory,
  createJobRoleCategory,
  updateJobRoleCategory,
  deleteJobRoleCategory,
} from "../services/jobRoleCategory.service";
import { ValidationError } from "../../../middleware/errorHandler";

function getRoleCategoryId(req: Request): string {
  const { roleCategoryId } = req.params;

  if (
    typeof roleCategoryId !== "string" ||
    !roleCategoryId
  ) {
    throw new ValidationError(
      "Role category id is required.",
    );
  }

  return roleCategoryId;
}

export async function listJobRoleCategoriesController(
  req: Request,
  res: Response,
) {
  const categories = await listJobRoleCategories();

  res.status(200).json({
    data: categories,
  });
}

export async function getJobRoleCategoryController(
  req: Request,
  res: Response,
) {
  const roleCategoryId = getRoleCategoryId(req);

  const category = await getJobRoleCategory(
    roleCategoryId,
  );

  res.status(200).json({
    data: category,
  });
}

export async function createJobRoleCategoryController(
  req: Request,
  res: Response,
) {
  const category = await createJobRoleCategory(
    req.body,
  );

  res.status(201).json({
    data: category,
  });
}

export async function updateJobRoleCategoryController(
  req: Request,
  res: Response,
) {
  const roleCategoryId = getRoleCategoryId(req);

  const category = await updateJobRoleCategory(
    roleCategoryId,
    req.body,
  );

  res.status(200).json({
    data: category,
  });
}

export async function deleteJobRoleCategoryController(
  req: Request,
  res: Response,
) {
  const roleCategoryId = getRoleCategoryId(req);

  const result = await deleteJobRoleCategory(
    roleCategoryId,
  );

  res.status(200).json({
    data: result,
  });
}