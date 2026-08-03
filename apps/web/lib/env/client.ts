import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_ENV: z.enum([
    "development",
    "staging",
    "production",
  ]),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
});

if (!parsed.success) {
  console.error("❌ Invalid frontend environment variables");
  console.error(parsed.error.flatten().fieldErrors);

  throw new Error("Invalid frontend environment variables.");
}

export const env = parsed.data;