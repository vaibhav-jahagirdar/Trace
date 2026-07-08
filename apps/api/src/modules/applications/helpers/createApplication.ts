import { PoolClient } from "pg";
import { ApplyJobBody } from "../apply/validator";
import { AppError } from "../../../middleware/errorHandler";

export async function createApplicationRecord(client: PoolClient,
    applicationId: string,
    jobId: string,
    applicationData: ApplyJobBody

) {
    const {firstName, lastName, email, phone} = applicationData;
    const applicationRecordResult = await client.query(
        `INSERT INTO job_applications
         (id, job_id, first_name, last_name, email, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [applicationId, jobId, firstName, lastName, email, phone]

    )
    if (applicationRecordResult.rowCount === 0) {
        throw new AppError("Failed to create application record");
    }
    return applicationRecordResult.rows[0];

}