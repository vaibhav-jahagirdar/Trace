import { Router } from "express";

import {
  listJobRoleCategoriesController,
  getJobRoleCategoryController,
  createJobRoleCategoryController,
  updateJobRoleCategoryController,
  deleteJobRoleCategoryController,
} from "../controllers/jobRoleCategory.controller";

const router = Router();

router.get(
  "/",
  listJobRoleCategoriesController,
);

router.get(
  "/:roleCategoryId",
  getJobRoleCategoryController,
);

router.post(
  "/",
  createJobRoleCategoryController,
);

router.patch(
  "/:roleCategoryId",
  updateJobRoleCategoryController,
);

router.delete(
  "/:roleCategoryId",
  deleteJobRoleCategoryController,
);

export default router;