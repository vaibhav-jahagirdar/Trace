import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { createJob } from "./services/jobs.create.service";
import { publishJob } from "./services/[jobId]/jobs.publish.service";
import { getJob } from "./services/[jobId]/job.get.service";
import { getActiveDraft, upsertDraft } from "./services/helpers/jobDraft";
import { getJobPreview } from "./services/[jobId]/job.preview.service";
import { listOrganizationJobs } from "./services/jobs.list.service";
import { getJobControlRoom } from "./services/job.control-room.service";
import { getJobApplicationAnalysisReports, getJobApplicationResumeObject } from "./services/job.analysis-reports.service";
import { getOrganizationDashboard } from "./services/organization-dashboard.service";
import { updateJob, transitionJob, deleteJob } from "./services/jobs.manage.service";
import { updateJobSchema } from "./validators/create/jobs.validator";

function toDraftDto(draft: Awaited<ReturnType<typeof getActiveDraft>>) {
  if (!draft) return null;

  return {
    id: draft.id,
    formData: draft.form_data,
    currentStep: draft.current_step,
    status: draft.status,
    jobId: draft.job_id,
    createdAt: draft.created_at,
    updatedAt: draft.updated_at,
  };
}
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

    return res.status(200).json({ draft: toDraftDto(draft) });
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

    return res.status(200).json({ draft: toDraftDto(draft) });
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

export async function getJobPreviewController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    const orgId = req.params.orgId;
    const jobId = req.params.jobId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (typeof orgId !== "string" || typeof jobId !== "string") {
      return res.status(400).json({ message: "Invalid route params" });
    }
    return res.status(200).json({ preview: await getJobPreview(jobId, orgId, userId) });
  } catch (error) { next(error); }
}
export async function getJobController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const jobId = req.params.jobId;
    const orgId = req.params.orgId;

    if (typeof jobId !== "string") {
      return res.status(400).json({ message: "Invalid jobId" });
    }

    const result = await getJob(jobId, typeof orgId === "string" ? orgId : undefined);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateJobController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { orgId, jobId } = req.params;
    if (!userId || typeof orgId !== "string" || typeof jobId !== "string") return res.status(400).json({ message: "Invalid route params" });
    res.json({ message: "Job updated successfully", data: await updateJob(jobId, orgId, userId, updateJobSchema.parse(req.body)) });
  } catch (error) { next(error); }
}

export async function transitionJobController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { orgId, jobId } = req.params;
    const status = req.body?.status;
    if (!userId || typeof orgId !== "string" || typeof jobId !== "string") return res.status(400).json({ message: "Invalid route params" });
    if (!["PAUSED", "PUBLISHED", "CLOSED"].includes(status)) return res.status(400).json({ message: "Invalid job status" });
    res.json({ message: "Job status updated", data: await transitionJob(jobId, orgId, userId, status) });
  } catch (error) { next(error); }
}

export async function deleteJobController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { orgId, jobId } = req.params;
    if (!userId || typeof orgId !== "string" || typeof jobId !== "string") return res.status(400).json({ message: "Invalid route params" });
    res.json({ message: "Job archived", data: await deleteJob(jobId, orgId, userId) });
  } catch (error) { next(error); }
}

export async function getJobControlRoomController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const orgId = req.params.orgId;
    const jobId = req.params.jobId;
    if (typeof orgId !== "string" || typeof jobId !== "string") {
      return res.status(400).json({ message: "Invalid route params" });
    }

    return res.status(200).json(await getJobControlRoom(orgId, jobId));
  } catch (error) {
    next(error);
  }
}

export async function getJobApplicationAnalysisReportsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { orgId, jobId, applicationId } = req.params;
    if (typeof orgId !== "string" || typeof jobId !== "string" || typeof applicationId !== "string") {
      return res.status(400).json({ message: "Invalid route params" });
    }
    return res.status(200).json(
      await getJobApplicationAnalysisReports(orgId, jobId, applicationId),
    );
  } catch (error) {
    next(error);
  }
}

export async function getJobApplicationResumeController(req: Request, res: Response, next: NextFunction) {
  try {
    const { orgId, jobId, applicationId } = req.params;
    if (typeof orgId !== "string" || typeof jobId !== "string" || typeof applicationId !== "string") {
      return res.status(400).json({ message: "Invalid route params" });
    }
    const object = await getJobApplicationResumeObject(orgId, jobId, applicationId);
    res.setHeader("Content-Type", object.ContentType ?? "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    if (object.ContentLength) res.setHeader("Content-Length", String(object.ContentLength));
    if (!object.Body || typeof (object.Body as { pipe?: unknown }).pipe !== "function") {
      return res.status(502).json({ message: "Resume storage returned no readable body" });
    }
    (object.Body as any).pipe(res);
  } catch (error) {
    next(error);
  }
}

export async function getOrganizationDashboardController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const orgId = req.params.orgId;
    if (typeof orgId !== "string") return res.status(400).json({ message: "Invalid orgId" });
    return res.status(200).json(await getOrganizationDashboard(orgId));
  } catch (error) {
    next(error);
  }
}

export async function listJobsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const orgId = req.params.orgId;
    if (typeof orgId !== "string") {
      return res.status(400).json({ message: "Invalid orgId" });
    }

    const result = await listOrganizationJobs(orgId, {
      status: typeof req.query.status === "string" ? req.query.status as any : undefined,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      department: typeof req.query.department === "string" ? req.query.department : undefined,
      role: typeof req.query.role === "string" ? req.query.role : undefined,
      workMode: typeof req.query.workMode === "string" ? req.query.workMode : undefined,
      employmentType: typeof req.query.employmentType === "string" ? req.query.employmentType : undefined,
      sort: typeof req.query.sort === "string" ? req.query.sort as any : undefined,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
