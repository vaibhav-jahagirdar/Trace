"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const username = zod_1.z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/);
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
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/);
const optionalString = zod_1.z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? undefined : value), zod_1.z.string().optional());
const optionalUrl = zod_1.z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? undefined : value), zod_1.z.url().optional());
exports.registerSchema = zod_1.z.object({
    username,
    email,
    password,
    first_name: zod_1.z
        .string()
        .trim()
        .min(1)
        .max(100),
    last_name: optionalString.pipe(zod_1.z.string().max(100).optional()),
    phone: optionalString.pipe(zod_1.z.string().max(30).regex(/^\+?[0-9\s\-().]+$/).optional()),
    linkedin_url: optionalUrl,
    avatar_url: optionalUrl,
});
exports.loginSchema = zod_1.z.object({
    email,
    password: zod_1.z.string().min(1),
});
//# sourceMappingURL=auth.validator.js.map