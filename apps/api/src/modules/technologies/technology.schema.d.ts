import { z } from "zod";
export declare const technologyIdParamSchema: z.ZodObject<{
    technologyId: z.ZodUUID;
}, z.core.$strip>;
export declare const createTechnologySchema: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateTechnologySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=technology.schema.d.ts.map