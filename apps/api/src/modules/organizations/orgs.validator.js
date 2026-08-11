"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrganizationSchema = exports.orgIdParamSchema = void 0;
const zod_1 = require("zod");
const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;
exports.orgIdParamSchema = zod_1.z.object({
    orgId: zod_1.z.string().uuid(),
});
exports.createOrganizationSchema = zod_1.z.object({
    name: zod_1.z
        .string({ error: "Organization name is required" })
        .min(2, "Name must be at least 2 characters")
        .max(255, "Name must not exceed 255 characters")
        .trim(),
    slug: zod_1.z
        .string({ error: "Slug is required" })
        .min(3, "Slug must be at least 3 characters")
        .max(100, "Slug must not exceed 100 characters")
        .regex(SLUG_REGEX, "Slug may only contain letters, numbers, hyphens, and underscores")
        .trim()
        .toLowerCase(),
    description: zod_1.z
        .string()
        .max(1000, "Description must not exceed 1000 characters")
        .trim()
        .optional(),
    title: zod_1.z.string().max(255, "Title must not exceed 255 characters").trim().optional(),
});
//# sourceMappingURL=orgs.validator.js.map