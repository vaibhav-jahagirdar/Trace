import IORedis from "ioredis";

import { env } from "../config/env";

export const redis = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB,

  maxRetriesPerRequest: null,
  enableReadyCheck: true,

  lazyConnect: false,
});

redis.on("connect", () => {
  console.log("[Redis] Connected");
});

redis.on("error", (error) => {
  console.error("[Redis] Connection error:", error);
});
