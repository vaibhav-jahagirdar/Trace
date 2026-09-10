import { createServer, type Server } from "node:http";

import {
  repositoryPlannerWorker,
  repositoryVerifierWorker,
  resumeAnalysisWorker,
} from "./queues/worker";
import { processDueOrganizationDeletions, processDueOwnershipTransfers } from "./modules/organizations/services/orgs.manage.service";

const healthPort = Number(process.env.PORT ?? 8080);
const healthServer: Server = createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("worker ok");
});

healthServer.listen(healthPort, "0.0.0.0", () => {
  console.log(`[Worker] Health server listening on ${healthPort}`);
});

console.log("[Worker] Resume Analysis Worker Started");
const deletionSweep = setInterval(() => {
  void processDueOrganizationDeletions().catch((error) => console.error("[Organizations][deletion-processor] failed", error));
  void processDueOwnershipTransfers().catch((error) => console.error("[Organizations][ownership-transfer-processor] failed", error));
}, 60_000);

async function shutdown(signal: string) {
  console.log(`[Worker] Received ${signal}. Shutting down...`);

  try {
    clearInterval(deletionSweep);
    await new Promise<void>((resolve, reject) => {
      healthServer.close((error) => (error ? reject(error) : resolve()));
    });
    await Promise.all([
      resumeAnalysisWorker.close(),
      repositoryPlannerWorker.close(),
      repositoryVerifierWorker.close(),
    ]);

    console.log("[Worker] Shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("[Worker] Shutdown failed", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("uncaughtException", (error) => {
  console.error("[Worker] Uncaught Exception", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[Worker] Unhandled Rejection", reason);
  process.exit(1);
});
