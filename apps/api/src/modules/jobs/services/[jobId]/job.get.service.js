"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJob = getJob;
const transaction_1 = require("../../../../config/transaction");
const getPublishedJob_1 = require("../helpers/getPublishedJob");
const getJobDto_1 = require("../helpers/getJobDto");
async function getJob(jobId) {
    return (0, transaction_1.withTransaction)(async (client) => {
        const job = await (0, getPublishedJob_1.getPublishedJob)(client, jobId);
        return (0, getJobDto_1.toGetJobDto)(job);
    });
}
//# sourceMappingURL=job.get.service.js.map