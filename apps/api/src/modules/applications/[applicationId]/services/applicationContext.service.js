"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicationContext = getApplicationContext;
const transaction_1 = require("../../../../config/transaction");
const getApplicationForEvaluation_1 = require("../helpers/getApplicationForEvaluation");
const getApplicationTechnologies_1 = require("../helpers/getApplicationTechnologies");
const getApplicationConcepts_1 = require("../helpers/getApplicationConcepts");
const toApplicationContextDto_1 = require("../helpers/toApplicationContextDto");
async function getApplicationContext(applicationId) {
    return (0, transaction_1.withTransaction)(async (client) => {
        const application = await (0, getApplicationForEvaluation_1.getApplicationForEvaluation)(client, applicationId);
        const [technologies, concepts] = await Promise.all([
            (0, getApplicationTechnologies_1.getApplicationTechnologies)(client, applicationId),
            (0, getApplicationConcepts_1.getApplicationConcepts)(client, applicationId),
        ]);
        return {
            jobId: application.job_id,
            resumeObjectKey: application.resume_object_key,
            context: (0, toApplicationContextDto_1.toApplicationContextDto)(application, technologies, concepts),
        };
    });
}
//# sourceMappingURL=applicationContext.service.js.map