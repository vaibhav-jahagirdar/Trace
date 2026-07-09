import { Request, Response, NextFunction } from "express";

import {
  applyJobBodySchema,
  applyJobParamsSchema,
} from "./validator";
import { applyJob } from "./services/jobs.apply.service";

export async function applyJobController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { jobId } = applyJobParamsSchema.parse(req.params);

    const applicationData = applyJobBodySchema.parse(req.body);

    const result = await applyJob(
      req.file!,
      applicationData,
      jobId,
      applicationData.eligibility,
      applicationData.submission,
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}