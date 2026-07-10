import { PoolClient } from "pg";

export interface JobSuccessSignalRow {
  code: string;
  name: string;
  description: string | null;
  weight: number;
}

export async function getJobSuccessSignals(
  client: PoolClient,
  jobId: string,
): Promise<JobSuccessSignalRow[]> {
  const result = await client.query<JobSuccessSignalRow>(
    `
      SELECT
        ss.code,
        ss.name,
        ss.description,
        jss.weight
      FROM job_success_signals jss
      JOIN success_signals ss ON jss.success_signal_id = ss.id
      WHERE jss.job_id = $1
      ORDER BY jss.weight DESC
    `,
    [jobId],
  );

  return result.rows;
}