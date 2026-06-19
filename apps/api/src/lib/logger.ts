import pino from "pino";

const baseConfig = {
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.accessToken",
      "*.refreshToken",
    ],
    censor: "[REDACTED]",
  },
};

const config =
  process.env.NODE_ENV === "development"
    ? {
        ...baseConfig,
        transport: { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:HH:MM:ss" } },
      }
    : baseConfig;

export const logger = pino(config);