import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import type { IncomingMessage } from "http";
import { logger } from "../lib/logger";

type RequestWithUser = IncomingMessage & {
  user?: { id?: string };
};

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => {
    const requestId = req.headers["x-request-id"];
    return Array.isArray(requestId) ? (requestId[0] ?? randomUUID()) : (requestId ?? randomUUID());
  },
  customProps: (req) => ({
    userId: (req as RequestWithUser).user?.id,
  }),
});