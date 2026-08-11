import { z } from "zod";
export declare const evidenceCategoryIdParamSchema: z.ZodObject<{
    evidenceCategoryId: z.ZodString;
}, z.core.$strip>;
export declare const evaluationDimensionIdParamSchema: z.ZodObject<{
    evaluationDimensionId: z.ZodString;
}, z.core.$strip>;
export declare const successSignalIdParamSchema: z.ZodObject<{
    successSignalId: z.ZodString;
}, z.core.$strip>;
export declare const createEvaluationConfigSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateEvaluationConfigSchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, z.core.$strip>;
//# sourceMappingURL=evaluation-config.schema.d.ts.map