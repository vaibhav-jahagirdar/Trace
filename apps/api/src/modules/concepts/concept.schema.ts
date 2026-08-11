import { z } from "zod";

export const conceptIdParamSchema = z.object({
  conceptId: z.uuid(),
});

export const createConceptSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().max(100).nullable().optional(),
});

export const updateConceptSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  category: z.string().trim().max(100).nullable().optional(),
});