import { z } from "zod";

const username = z
  .string()
  .trim()
  .min(3)
  .max(50)
  .regex(/^[a-zA-Z0-9_-]+$/);

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(255);

const password = z
  .string()
  .min(8)
  .max(72)
  .regex(/[A-Z]/)
  .regex(/[a-z]/)
  .regex(/[0-9]/)
  .regex(/[^A-Za-z0-9]/);

export const registerSchema = z.object({
  username,
  email,
  password,

  first_name: z
    .string()
    .trim()
    .min(1)
    .max(100),

  last_name: z
    .string()
    .trim()
    .max(100)
    .optional(),

  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^\+?[0-9\s\-().]+$/)
    .optional(),

  linkedin_url: z
    .url()
    .optional(),

  avatar_url: z
    .url()
    .optional(),
});
export const loginSchema = z.object({
  email,
  password: z.string().min(1),
});
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;