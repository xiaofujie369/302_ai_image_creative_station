import { createEnv } from "@t3-oss/env-nextjs";
import { ZodError, z } from "zod";

// Define and validate the environment variables
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_LOG_LEVEL: z
      .enum(["trace", "debug", "info", "warn", "error"])
      .default("debug"),
    NEXT_PUBLIC_302_WEBSITE_URL_GLOBAL: z.string().default("https://302.ai/"),
    NEXT_PUBLIC_302_WEBSITE_URL_CHINA: z.string().default("https://302ai.cn/"),
    NEXT_PUBLIC_302_API_KEY: z.string().optional(),
    NEXT_PUBLIC_API_URL: z.string().default("https://api.302.ai"),
    NEXT_PUBLIC_AUTH_API_URL: z.string().default("https://dash-api.302.ai"),
    NEXT_PUBLIC_AUTH_PATH: z.string().default("/auth"),
    NEXT_PUBLIC_IS_CHINA: z.boolean().default(false),
    NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default("en"),
    NEXT_PUBLIC_DEFAULT_MODEL_NAME: z.string().default("gpt-image-2"),
    NEXT_PUBLIC_DEV_HOST_NAME: z.string().optional(),
    NEXT_PUBLIC_HIDE_BRAND: z.boolean().optional(),
  },
  // Runtime environment configuration
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV || "development",
    NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || "debug",
    NEXT_PUBLIC_302_WEBSITE_URL_GLOBAL:
      process.env.NEXT_PUBLIC_302_WEBSITE_URL_GLOBAL || "https://302.ai/",
    NEXT_PUBLIC_302_WEBSITE_URL_CHINA:
      process.env.NEXT_PUBLIC_302_WEBSITE_URL_CHINA || "https://302ai.cn/",
    NEXT_PUBLIC_302_API_KEY: process.env.NEXT_PUBLIC_302_API_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.302.ai",
    NEXT_PUBLIC_AUTH_API_URL:
      process.env.NEXT_PUBLIC_AUTH_API_URL || "https://dash-api.302.ai",
    NEXT_PUBLIC_AUTH_PATH: process.env.NEXT_PUBLIC_AUTH_PATH || "/auth",
    NEXT_PUBLIC_IS_CHINA: process.env.NEXT_PUBLIC_IS_CHINA === "true",
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en",
    NEXT_PUBLIC_DEFAULT_MODEL_NAME:
      process.env.NEXT_PUBLIC_DEFAULT_MODEL_NAME || "gpt-image-2",
    NEXT_PUBLIC_DEV_HOST_NAME: process.env.NEXT_PUBLIC_DEV_HOST_NAME,
    NEXT_PUBLIC_HIDE_BRAND: process.env.NEXT_PUBLIC_HIDE_BRAND === "true",
  },
  // Handle validation errors
  onValidationError: (error: ZodError) => {
    console.error(
      "❌ Invalid environment variables:",
      error.flatten().fieldErrors
    );
    process.exit(1);
  },
  emptyStringAsUndefined: true, // Treat empty strings as undefined
});
