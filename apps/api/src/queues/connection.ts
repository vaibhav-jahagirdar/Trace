import { ConnectionOptions } from "bullmq";

import { env } from "../config/env";

export const redisConnection: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB,

  maxRetriesPerRequest: null,
  enableReadyCheck: true,
};