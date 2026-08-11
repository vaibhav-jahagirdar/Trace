import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    first_name: z.ZodString;
    last_name: z.ZodPipe<z.ZodPreprocess<z.ZodOptional<z.ZodString>>, z.ZodOptional<z.ZodString>>;
    phone: z.ZodPipe<z.ZodPreprocess<z.ZodOptional<z.ZodString>>, z.ZodOptional<z.ZodString>>;
    linkedin_url: z.ZodPreprocess<z.ZodOptional<z.ZodURL>>;
    avatar_url: z.ZodPreprocess<z.ZodOptional<z.ZodURL>>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
//# sourceMappingURL=auth.validator.d.ts.map