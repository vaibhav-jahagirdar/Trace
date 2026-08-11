import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    first_name: z.ZodString;
    last_name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    linkedin_url: z.ZodOptional<z.ZodURL>;
    avatar_url: z.ZodOptional<z.ZodURL>;
    email: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const createInviteSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export declare const acceptInviteSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    first_name: z.ZodString;
    last_name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    linkedin_url: z.ZodOptional<z.ZodURL>;
    avatar_url: z.ZodOptional<z.ZodURL>;
    token: z.ZodString;
}, z.core.$strip>;
export declare const revokeInviteSchema: z.ZodObject<{
    inviteId: z.ZodUUID;
}, z.core.$strip>;
export declare const inviteListQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        ACCEPTED: "ACCEPTED";
        REVOKED: "REVOKED";
        EXPIRED: "EXPIRED";
    }>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateInviteInput = z.infer<typeof createInviteSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type RevokeInviteInput = z.infer<typeof revokeInviteSchema>;
export type InviteListQuery = z.infer<typeof inviteListQuerySchema>;
//# sourceMappingURL=invites.validator.d.ts.map