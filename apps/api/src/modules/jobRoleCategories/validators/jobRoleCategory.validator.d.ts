import { z } from "zod";
export declare const roleCategoryIdParamSchema: z.ZodObject<{
    roleCategoryId: z.ZodUUID;
}, z.core.$strip>;
export declare const createJobRoleCategorySchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateJobRoleCategorySchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type CreateJobRoleCategoryInput = z.infer<typeof createJobRoleCategorySchema>;
export type UpdateJobRoleCategoryInput = z.infer<typeof updateJobRoleCategorySchema>;
//# sourceMappingURL=jobRoleCategory.validator.d.ts.map