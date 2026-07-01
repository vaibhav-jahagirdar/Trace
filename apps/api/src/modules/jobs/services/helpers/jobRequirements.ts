import { PoolClient } from "pg";
import { AppError } from "../../../../middleware/errorHandler";
import type { WeightedJobRequirementInput } from "../../logic/logic";

export async function createJobRequirementRecord(
  requirements: WeightedJobRequirementInput[],
  jobId: string,
  client: PoolClient,
) {
  if (requirements.length === 0) {
    throw new AppError(
      "At least one job requirement is required.",
      400,
      "INVALID_JOB_REQUIREMENTS",
    );
  }

  const values: unknown[] = [];
  const placeholders: string[] = [];

  requirements.forEach((requirement, index) => {
    const offset = index * 6;

    placeholders.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`,
    );

    values.push(
      jobId,
      requirement.requirement_type === "TECHNOLOGY"
        ? requirement.technology_id
        : null,
      requirement.requirement_type === "CONCEPT"
        ? requirement.concept_id
        : null,
      requirement.requirement_type,
      requirement.priority_type,
      requirement.weight,
    );
  });

  const result = await client.query(
    `
      INSERT INTO job_requirements (
        job_id,
        technology_id,
        concept_id,
        requirement_type,
        priority_type,
        weight
      )
      VALUES
      ${placeholders.join(",")}
      RETURNING id
    `,
    values,
  );

  if (result.rowCount !== requirements.length) {
    throw new AppError(
      "Failed to create job requirements.",
      500,
      "JOB_REQUIREMENTS_CREATION_FAILED",
    );
  }

  return result.rows.map((row) => row.id);
}