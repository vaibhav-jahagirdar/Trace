"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEvaluationConfigSchema = exports.createEvaluationConfigSchema = exports.successSignalIdParamSchema = exports.evaluationDimensionIdParamSchema = exports.evidenceCategoryIdParamSchema = void 0;
const zod_1 = require("zod");
exports.evidenceCategoryIdParamSchema = zod_1.z.object({
    evidenceCategoryId: zod_1.z.string().uuid(),
});
exports.evaluationDimensionIdParamSchema = zod_1.z.object({
    evaluationDimensionId: zod_1.z.string().uuid(),
});
exports.successSignalIdParamSchema = zod_1.z.object({
    successSignalId: zod_1.z.string().uuid(),
});
exports.createEvaluationConfigSchema = zod_1.z.object({
    code: zod_1.z.string().trim().min(1).max(100),
    name: zod_1.z.string().trim().min(1).max(255),
    description: zod_1.z.string().trim().nullable().optional(),
});
exports.updateEvaluationConfigSchema = exports.createEvaluationConfigSchema.partial();
//# sourceMappingURL=evaluation-config.schema.js.map