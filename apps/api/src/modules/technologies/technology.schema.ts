import { z } from "zod";

export const technologyIdParamSchema = z.object({
  technologyId: z.uuid(),
});

export const createTechnologySchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().max(100).nullable().optional(),
});

export const updateTechnologySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  category: z.string().trim().max(100).nullable().optional(),
});