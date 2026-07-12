import "dotenv/config";
import { analyzeResume } from "../src/modules/applications/analysis/resume/client/analysis.client";

analyzeResume(
  "a7000000-0000-0000-0000-000000000001",
  "ab000000-0000-0000-0000-000000000001",
)
  .then((res) => {
    console.log("SUCCESS:");
    console.log(JSON.stringify(res, null, 2));
  })
  .catch((err) => {
    console.error("FAILED:", err);
  });