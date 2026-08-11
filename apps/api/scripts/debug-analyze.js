"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const analysis_client_1 = require("../src/modules/applications/analysis/resume/client/analysis.client");
(0, analysis_client_1.analyzeResume)("a7000000-0000-0000-0000-000000000001", "ab000000-0000-0000-0000-000000000001")
    .then((res) => {
    console.log("SUCCESS:");
    console.log(JSON.stringify(res, null, 2));
})
    .catch((err) => {
    console.error("FAILED:", err);
});
//# sourceMappingURL=debug-analyze.js.map