import { z } from "zod";

export const evidenceCategoryIdParamSchema = z.object({
  evidenceCategoryId: z.string().uuid(),
});

export const evaluationDimensionIdParamSchema = z.object({
  evaluationDimensionId: z.string().uuid(),
});

export const successSignalIdParamSchema = z.object({
  successSignalId: z.string().uuid(),
});

export const createEvaluationConfigSchema = z.object({
  code: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().nullable().optional(),
});

export const updateEvaluationConfigSchema =
  createEvaluationConfigSchema.partial();