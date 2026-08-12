import { Request, Response, NextFunction } from "express";

import {
  applyJobBodySchema,
  applyJobParamsSchema,
  publicApplyJobParamsSchema,
} from "./validator";
import { applyJob } from "./services/jobs.apply.service";
import { getPublicJob, resolvePublicJobId } from "../../jobs/services/publicJob.service";

export async function applyJobController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { jobId } = applyJobParamsSchema.parse(req.params);

    const applicationData = applyJobBodySchema.parse(parseApplicationBody(req.body));

    const result = await applyJob(
      req.file!,
      applicationData,
      jobId,
      applicationData.eligibility,
      applicationData.submission,
    );

    const statusCode = result.passed ? 202 : 201;

    res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
}

function parseApplicationBody(body: Record<string, unknown>) {
  const parsed = { ...body };
  for (const key of ["eligibility", "submission", "technologies", "concepts"]) {
    if (typeof parsed[key] !== "string") continue;
    try {
      parsed[key] = JSON.parse(parsed[key] as string);
    } catch {
      // Zod will return the normal field validation error for malformed JSON.
    }
  }
  return parsed;
}

export async function getPublicJobController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { orgSlug, jobSlug } = publicApplyJobParamsSchema.parse(req.params);
    return res.status(200).json({ job: await getPublicJob(orgSlug, jobSlug) });
  } catch (error) {
    next(error);
  }
}

export async function applyPublicJobController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { orgSlug, jobSlug } = publicApplyJobParamsSchema.parse(req.params);
    const applicationData = applyJobBodySchema.parse(parseApplicationBody(req.body));
    const jobId = await resolvePublicJobId(orgSlug, jobSlug);

    const result = await applyJob(
      req.file!,
      applicationData,
      jobId,
      applicationData.eligibility,
      applicationData.submission,
    );

    return res.status(result.passed ? 202 : 201).json(result);
  } catch (error) {
    next(error);
  }
}
