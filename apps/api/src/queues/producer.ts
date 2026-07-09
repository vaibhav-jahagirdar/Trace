

import { Queue } from "bullmq";

import { env } from "../config/env";
import { redisConnection } from "./connection";

export const resumeAnalysisQueue = new Queue(
  env.BULLMQ_RESUME_QUEUE,
  {
    connection: redisConnection,

    defaultJobOptions: {
      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 5000,
      },

      removeOnComplete: 1000,

      removeOnFail: 5000,
    },
  },
);