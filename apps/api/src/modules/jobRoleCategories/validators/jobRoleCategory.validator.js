"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJobRoleCategorySchema = exports.createJobRoleCategorySchema = exports.roleCategoryIdParamSchema = void 0;
const zod_1 = require("zod");
exports.roleCategoryIdParamSchema = zod_1.z.object({
    roleCategoryId: zod_1.z.uuid(),
});
exports.createJobRoleCategorySchema = zod_1.z.object({
    code: zod_1.z
        .string()
        .trim()
        .min(2)
        .max(100)
        .regex(/^[A-Z0-9_]+$/, "Code must contain only uppercase letters, numbers, and underscores"),
    name: zod_1.z
        .string()
        .trim()
        .min(2)
        .max(255),
    description: zod_1.z
        .string()
        .trim()
        .max(2000)
        .optional(),
});
exports.updateJobRoleCategorySchema = exports.createJobRoleCategorySchema.partial();
//# sourceMappingURL=jobRoleCategory.validator.js.map