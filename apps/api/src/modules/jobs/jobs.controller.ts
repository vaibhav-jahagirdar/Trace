import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { createJob } from "./services/jobs.create.service";
import { publishJob } from "./services/[jobId]/jobs.publish.service";

export async function createJobController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    const orgId = req.params.orgId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (typeof orgId !== "string") {
      return res.status(400).json({ message: "Invalid orgId" });
    }

    const {
      eligibility,
      submission_requirements,
      requirements,
      evaluation_priorities,
      evidence_priorities,
      success_signals,
      ...jobData
    } = req.body;

    const result = await createJob(
      userId,
      orgId,
      jobData,
      eligibility,
      submission_requirements,
      requirements,
      evaluation_priorities,
      evidence_priorities,
      success_signals,
    );

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function publishJobController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    const orgId = req.params.orgId;
    const jobId = req.params.jobId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (typeof orgId !== "string" || typeof jobId !== "string") {
      return res.status(400).json({ message: "Invalid route params" });
    }

    const result = await publishJob(
      jobId,
      orgId,
      userId,
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}