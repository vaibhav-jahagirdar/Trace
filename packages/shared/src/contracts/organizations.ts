import { z } from "zod";

const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;
    export const orgIdParamSchema = z.object({
  orgId: z.string().uuid(),
});

export const createOrganizationSchema = z.object({
  name: z
    .string({ error: "Organization name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must not exceed 255 characters")
    .trim(),

  slug: z
    .string({ error: "Slug is required" })
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug must not exceed 100 characters")
    .regex(SLUG_REGEX, "Slug may only contain letters, numbers, hyphens, and underscores")
    .trim()
    .toLowerCase(),


  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .trim()
    .optional(),
    title: z.string().max(255, "Title must not exceed 255 characters").trim().optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;