import { PoolClient } from "pg";

export interface JobRequirementRow {
  requirement_type: "TECHNOLOGY" | "CONCEPT";
  priority_type: "MANDATORY" | "PREFERRED" | "BONUS";
  weight: string; 
  name: string;
  
  category: string | null;
}

export async function getJobRequirements(
  client: PoolClient,
  jobId: string,
): Promise<JobRequirementRow[]> {
  const result = await client.query<JobRequirementRow>(
    `
      SELECT
        jr.requirement_type,
        jr.priority_type,
        jr.weight,
        COALESCE(t.name, c.name) AS name,
        COALESCE(t.category, c.category) AS category
      FROM job_requirements jr
      LEFT JOIN technologies t ON jr.technology_id = t.id
      LEFT JOIN concepts c ON jr.concept_id = c.id
      WHERE jr.job_id = $1
      ORDER BY jr.priority_type, jr.weight DESC
    `,
    [jobId],
  );

  return result.rows;
}