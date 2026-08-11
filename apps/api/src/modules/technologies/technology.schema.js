"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTechnologySchema = exports.createTechnologySchema = exports.technologyIdParamSchema = void 0;
const zod_1 = require("zod");
exports.technologyIdParamSchema = zod_1.z.object({
    technologyId: zod_1.z.uuid(),
});
exports.createTechnologySchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(100),
    category: zod_1.z.string().trim().max(100).nullable().optional(),
});
exports.updateTechnologySchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(100).optional(),
    category: zod_1.z.string().trim().max(100).nullable().optional(),
});
//# sourceMappingURL=technology.schema.js.map