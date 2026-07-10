import { PoolClient } from "pg";

export interface JobEvaluationPriorityRow {
  code: string;
  name: string;
  description: string | null;
  weight: number;
}

export async function getJobEvaluationPriorities(
  client: PoolClient,
  jobId: string,
): Promise<JobEvaluationPriorityRow[]> {
  const result = await client.query<JobEvaluationPriorityRow>(
    `
      SELECT
        ed.code,
        ed.name,
        ed.description,
        jep.weight
      FROM job_evaluation_priorities jep
      JOIN evaluation_dimensions ed ON jep.evaluation_dimension_id = ed.id
      WHERE jep.job_id = $1
      ORDER BY jep.weight DESC
    `,
    [jobId],
  );

  return result.rows;
}