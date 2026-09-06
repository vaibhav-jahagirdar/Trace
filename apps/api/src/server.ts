import "dotenv/config";
import app from "./app";
import { processDueOrganizationDeletions, processDueOwnershipTransfers } from "./modules/organizations/services/orgs.manage.service";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
  const deletionSweep = setInterval(() => {
    void processDueOrganizationDeletions().catch((error) => console.error("[Organizations][deletion-processor] failed", error));
    void processDueOwnershipTransfers().catch((error) => console.error("[Organizations][ownership-transfer-processor] failed", error));
  }, 60_000);
  deletionSweep.unref();
});
