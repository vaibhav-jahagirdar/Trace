import { z } from "zod";
export declare const orgIdParamSchema: z.ZodObject<{
    orgId: z.ZodString;
}, z.core.$strip>;
export declare const createOrganizationSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
//# sourceMappingURL=orgs.validator.d.ts.map