import type { Request, Response, NextFunction } from "express";
import { manuallyEnqueueRepositoryPlanner } from "../applications/analysis/github/planner/services/repoPlannerTrigger.service";

export async function manuallyPlanRepositoryController(req: Request, res: Response, next: NextFunction) {
  try {
    const applicationId = req.params.applicationId;
    if (typeof applicationId !== "string") return res.status(400).json({ message: "Invalid applicationId" });
    const taskId = await manuallyEnqueueRepositoryPlanner(applicationId);
    res.status(202).json({ queued: Boolean(taskId), taskId });
  } catch (error) {
    next(error);
  }
}
