import { z } from "zod";

export const roleCategoryIdParamSchema = z.object({
  roleCategoryId: z.uuid(),
});

export const createJobRoleCategorySchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(
      /^[A-Z0-9_]+$/,
      "Code must contain only uppercase letters, numbers, and underscores",
    ),

  name: z
    .string()
    .trim()
    .min(2)
    .max(255),

  description: z
    .string()
    .trim()
    .max(2000)
    .optional(),
});

export const updateJobRoleCategorySchema =
  createJobRoleCategorySchema.partial();

export type CreateJobRoleCategoryInput =
  z.infer<typeof createJobRoleCategorySchema>;

export type UpdateJobRoleCategoryInput =
  z.infer<typeof updateJobRoleCategorySchema>;