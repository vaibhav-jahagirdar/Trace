import { AppError, ValidationError } from "../../../../middleware/errorHandler";
import { PoolClient } from "pg";
import type {
  JobEvaluationPrioritiesInput,
  JobEvaluationPriorityInput,
} from "../../validators/create/jobs.validator";

export async function createJobEvaluationPriorityRecords(
  evaluationPriorities: JobEvaluationPrioritiesInput,
  jobId: string,
  client: PoolClient,
) {
  if (evaluationPriorities.length === 0) {
    throw new ValidationError(
      "At least one evaluation priority must be provided.",
    );
  }

  const values: unknown[] = [];
  const placeholders: string[] = [];
  evaluationPriorities.forEach((priority, index) => {
    const offset = index * 3;
    values.push(jobId, priority.evaluation_dimension_id, priority.weight);
    placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
  });
  const result = await client.query(
    `INSERT INTO job_evaluation_priorities  (
         job_id, 
         evaluation_dimension_id,
         weight
        ) VALUES ${placeholders.join(",")}
        RETURNING id`,
    values,
  );
  if (result.rowCount !== evaluationPriorities.length) {
    throw new AppError(
      "Failed to create job evaluation priority records",
      500,
      "FAILED_TO_CREATE_JOB_EVALUATION_PRIORITIES",
    );
  }
  return result.rows.map((row) => row.id);
}
