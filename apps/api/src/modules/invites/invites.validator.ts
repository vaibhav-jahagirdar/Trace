import { z } from "zod";


const username = z
  .string()
  .trim()
  .min(3)
  .max(50)
  .regex(/^[a-zA-Z0-9_-]+$/, {
    message:
      "Username may only contain letters, numbers, underscores, and hyphens",
  });

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
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(/[0-9]/, {
    message: "Password must contain at least one number",
  })
  .regex(/[^A-Za-z0-9]/, {
    message: "Password must contain at least one special character",
  });

const profileFields = {
  username,
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
    .regex(/^\+?[0-9\s\-().]+$/, {
      message: "Invalid phone number format",
    })
    .optional(),

  linkedin_url: z
    .url()
    .optional(),

  avatar_url: z
    .url()
    .optional(),
};



export const registerSchema = z.object({
  email,
  ...profileFields,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1),
});



export const createInviteSchema = z.object({
  email,
});

export const acceptInviteSchema = z.object({
  token: z.string().length(128), 
  ...profileFields,
});

export const revokeInviteSchema = z.object({
  inviteId: z.uuid(),
});

export const inviteListQuerySchema = z.object({
  status: z
    .enum([
      "ACTIVE",
      "ACCEPTED",
      "REVOKED",
      "EXPIRED",
    ])
    .optional(),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});



export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type CreateInviteInput = z.infer<
  typeof createInviteSchema
>;

export type AcceptInviteInput = z.infer<
  typeof acceptInviteSchema
>;

export type RevokeInviteInput = z.infer<
  typeof revokeInviteSchema
>;

export type InviteListQuery = z.infer<
  typeof inviteListQuerySchema
>;