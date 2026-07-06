import { AppError, ValidationError } from "../../../../middleware/errorHandler";
import type { JobEvidencePrioritiesInput } from "../../jobs.validator";
import { PoolClient } from "pg";

export async function createJobEvidencePriorityRecords(
  evidencePriorities: JobEvidencePrioritiesInput,
  jobId: string,
  client: PoolClient,
) {
    if (evidencePriorities.length === 0)  {
        throw new ValidationError("At least one evidence priority must be provided.")
    }
    const values: unknown[] = [];
  const placeholders: string[] = [];
  evidencePriorities.forEach((priority, index) => {
    const offset = index * 3;
    values.push(jobId, priority.evidence_category_id, priority.weight);
    placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
  });
  const result = await client.query(
    `INSERT INTO job_evidence_priorities  (
         job_id, 
         evidence_category_id,
         weight
        ) VALUES ${placeholders.join(",")}
        RETURNING id`,
    values,
  );
  if (result.rowCount !== evidencePriorities.length) {
    throw new AppError(
      "Failed to create job evaluation priority records",
      500,
      "FAILED_TO_CREATE_JOB_EVALUATION_PRIORITIES",
    );
  }
  return result.rows.map((row) => row.id);

}