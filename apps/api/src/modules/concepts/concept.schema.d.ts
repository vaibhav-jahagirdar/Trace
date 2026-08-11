import { z } from "zod";
export declare const conceptIdParamSchema: z.ZodObject<{
    conceptId: z.ZodUUID;
}, z.core.$strip>;
export declare const createConceptSchema: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateConceptSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=concept.schema.d.ts.map