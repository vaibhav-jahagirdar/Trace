import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { createJob } from "./services/jobs.create.service";
import { publishJob } from "./services/[jobId]/jobs.publish.service";
import { getJob } from "./services/[jobId]/job.get.service";
import { getActiveDraft, upsertDraft } from "./services/helpers/jobDraft";
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
      draftId,
      eligibility,
      submission_requirements,
      requirements,
      evaluation_priorities,
      evidence_priorities,
      success_signals,
      ...jobData
    } = req.body;

    if (typeof draftId !== "string") {
      return res.status(400).json({ message: "Invalid draftId" });
    }

    const result = await createJob(
      userId,
      orgId,
      draftId,
      jobData,
      eligibility,
      submission_requirements,
      requirements,
      evaluation_priorities,
      evidence_priorities,
      success_signals,
    );

    
    if ("alreadySubmitted" in result && result.alreadySubmitted) {
      return res.status(200).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getJobDraftController(
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

    const draft = await getActiveDraft(userId, orgId);

    return res.status(200).json({ draft });
  } catch (error) {
    next(error);
  }
}

export async function saveJobDraftController(
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

    const { formData, currentStep } = req.body;

    if (typeof formData !== "object" || formData === null) {
      return res.status(400).json({ message: "Invalid formData" });
    }

    if (typeof currentStep !== "number") {
      return res.status(400).json({ message: "Invalid currentStep" });
    }

    const draft = await upsertDraft(userId, orgId, formData, currentStep);

    return res.status(200).json({ draft });
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
export async function getJobController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const jobId = req.params.jobId;

    if (typeof jobId !== "string") {
      return res.status(400).json({ message: "Invalid jobId" });
    }

    const result = await getJob(jobId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}