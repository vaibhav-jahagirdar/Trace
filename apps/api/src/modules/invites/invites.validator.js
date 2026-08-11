"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteListQuerySchema = exports.revokeInviteSchema = exports.acceptInviteSchema = exports.createInviteSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const username = zod_1.z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/, {
    message: "Username may only contain letters, numbers, underscores, and hyphens",
});
const email = zod_1.z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .max(255);
const password = zod_1.z
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
    first_name: zod_1.z
        .string()
        .trim()
        .min(1)
        .max(100),
    last_name: zod_1.z
        .string()
        .trim()
        .max(100)
        .optional(),
    phone: zod_1.z
        .string()
        .trim()
        .max(30)
        .regex(/^\+?[0-9\s\-().]+$/, {
        message: "Invalid phone number format",
    })
        .optional(),
    linkedin_url: zod_1.z
        .url()
        .optional(),
    avatar_url: zod_1.z
        .url()
        .optional(),
};
exports.registerSchema = zod_1.z.object({
    email,
    ...profileFields,
});
exports.loginSchema = zod_1.z.object({
    email,
    password: zod_1.z.string().min(1),
});
exports.createInviteSchema = zod_1.z.object({
    email,
});
exports.acceptInviteSchema = zod_1.z.object({
    token: zod_1.z.string().length(128),
    ...profileFields,
});
exports.revokeInviteSchema = zod_1.z.object({
    inviteId: zod_1.z.uuid(),
});
exports.inviteListQuerySchema = zod_1.z.object({
    status: zod_1.z
        .enum([
        "ACTIVE",
        "ACCEPTED",
        "REVOKED",
        "EXPIRED",
    ])
        .optional(),
    page: zod_1.z.coerce
        .number()
        .int()
        .min(1)
        .default(1),
    limit: zod_1.z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20),
});
//# sourceMappingURL=invites.validator.js.map