"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConceptSchema = exports.createConceptSchema = exports.conceptIdParamSchema = void 0;
const zod_1 = require("zod");
exports.conceptIdParamSchema = zod_1.z.object({
    conceptId: zod_1.z.uuid(),
});
exports.createConceptSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(100),
    category: zod_1.z.string().trim().max(100).nullable().optional(),
});
exports.updateConceptSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(100).optional(),
    category: zod_1.z.string().trim().max(100).nullable().optional(),
});
//# sourceMappingURL=concept.schema.js.map