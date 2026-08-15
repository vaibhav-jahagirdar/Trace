import { getDb } from "../../../config/db";
import { NotFoundError } from "../../../middleware/errorHandler";

export interface JobControlRoomResult {
  job: {
    id: string;
    title: string;
    department: string | null;
    role: string | null;
    status: string;
    employmentType: string;
    workMode: string;
    openPositions: number;
    createdAt: string;
    updatedAt: string;
  };
  pipeline: {
    applied: number;
    eligible: number;
    stage1Complete: number;
    stage2aComplete: number;
    stage2cComplete: number;
    shortlisted: number;
    interviewing: number;
  };
  analysis: {
    stage1: { complete: number; running: number; waiting: number };
    stage2a: { complete: number; running: number; waiting: number };
    stage2c: { complete: number; running: number; waiting: number };
  };
  candidates: Array<{
    id: string;
    name: string;
    status: string;
    stage1Score: number | null;
    stage2cScore: number | null;
    finalScore: number | null;
    stage1Status: "COMPLETE" | "WAITING";
    stage2aStatus: "COMPLETE" | "RUNNING" | "WAITING";
    stage2cStatus: "COMPLETE" | "RUNNING" | "WAITING";
  }>;
}

export async function getJobControlRoom(
  organizationId: string,
  jobId: string,
): Promise<JobControlRoomResult> {
  const db = getDb();
  const jobResult = await db.query<{
    id: string;
    title: string;
    department: string | null;
    role: string | null;
    status: string;
    employment_type: string;
    work_mode: string;
    open_positions: number;
    created_at: string;
    updated_at: string;
  }>(
    `
    SELECT j.id, j.title, j.department, rc.name AS role, j.status,
           j.employment_type, j.work_mode, j.open_positions,
           j.created_at, j.updated_at
    FROM jobs j
    LEFT JOIN job_role_categories rc ON rc.id = j.role_category_id
    WHERE j.id = $1 AND j.organization_id = $2 AND j.deleted_at IS NULL
    LIMIT 1
    `,
    [jobId, organizationId],
  );

  const job = jobResult.rows[0];
  if (!job) throw new NotFoundError("Job not found");

  const rows = await db.query<{
    application_id: string;
    name: string;
    application_status: string;
    stage1_score: number | string | null;
    stage2c_score: number | string | null;
    stage1_status: string;
    stage2a_status: string;
    stage2c_status: string;
  }>(
    `
    SELECT
      ja.id AS application_id,
      CONCAT(ja.first_name, ' ', ja.last_name) AS name,
      ja.status AS application_status,
      ra.final_alignment_score AS stage1_score,
      sr.combined_score AS stage2c_score,
      CASE WHEN ra.id IS NULL THEN 'WAITING' ELSE 'COMPLETE' END AS stage1_status,
      CASE
        WHEN planner_task.status = 'COMPLETED' AND plan.planning_status = 'COMPLETED' THEN 'COMPLETE'
        WHEN planner_task.status = 'RUNNING' THEN 'RUNNING'
        ELSE 'WAITING'
      END AS stage2a_status,
      CASE
        WHEN verifier_task.status = 'COMPLETED' AND vr.status = 'COMPLETED' THEN 'COMPLETE'
        WHEN verifier_task.status = 'RUNNING' OR vr.status IN ('RETRIEVING', 'LLM_COMPLETED') THEN 'RUNNING'
        ELSE 'WAITING'
      END AS stage2c_status
    FROM job_applications ja
    LEFT JOIN application_resume_analyses ra
      ON ra.job_application_id = ja.id AND ra.is_current = true
    LEFT JOIN application_tasks planner_task
      ON planner_task.job_application_id = ja.id AND planner_task.task_type = 'REPOSITORY_PLAN'
    LEFT JOIN application_repository_analyses plan
      ON plan.application_task_id = planner_task.id
    LEFT JOIN application_tasks verifier_task
      ON verifier_task.job_application_id = ja.id AND verifier_task.task_type = 'REPOSITORY_VERIFY'
    LEFT JOIN LATERAL (
      SELECT vr2.*
      FROM application_repository_verifier_runs vr2
      JOIN application_repository_analyses ra2
        ON ra2.id = vr2.application_repository_analysis_id
      JOIN application_tasks pt2
        ON pt2.id = ra2.application_task_id
      WHERE pt2.job_application_id = ja.id
      ORDER BY vr2.created_at DESC
      LIMIT 1
    ) vr ON true
    LEFT JOIN LATERAL (
      SELECT sr2.combined_score
      FROM application_repository_score_runs sr2
      JOIN application_repository_verifier_runs vr3
        ON vr3.id = sr2.verifier_run_id
      WHERE vr3.id = vr.id
      ORDER BY sr2.created_at DESC
      LIMIT 1
    ) sr ON true
    WHERE ja.job_id = $1
    ORDER BY COALESCE(sr.combined_score, ra.final_alignment_score, 0) DESC, ja.created_at ASC
    LIMIT 100
    `,
    [jobId],
  );

  const counts = rows.rows.reduce(
    (acc, row) => {
      acc.applied += 1;
      if (!['REJECTED', 'WITHDRAWN'].includes(row.application_status)) acc.eligible += 1;
      if (row.stage1_status === 'COMPLETE') acc.stage1Complete += 1;
      if (row.stage2a_status === 'COMPLETE') acc.stage2aComplete += 1;
      if (row.stage2c_status === 'COMPLETE') acc.stage2cComplete += 1;
      if (['SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED'].includes(row.application_status)) acc.shortlisted += 1;
      if (row.application_status === 'INTERVIEW') acc.interviewing += 1;
      return acc;
    },
    { applied: 0, eligible: 0, stage1Complete: 0, stage2aComplete: 0, stage2cComplete: 0, shortlisted: 0, interviewing: 0 },
  );

  const stageStats = (stage: "stage1" | "stage2a" | "stage2c") => {
    const statuses = rows.rows.map((row) => row[`${stage}_status` as keyof typeof row] as string);
    return {
      complete: statuses.filter((value) => value === "COMPLETE").length,
      running: statuses.filter((value) => value === "RUNNING").length,
      waiting: statuses.filter((value) => value === "WAITING").length,
    };
  };

  return {
    job: {
      id: job.id,
      title: job.title,
      department: job.department,
      role: job.role,
      status: job.status,
      employmentType: job.employment_type,
      workMode: job.work_mode,
      openPositions: Number(job.open_positions),
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    },
    pipeline: counts,
    analysis: { stage1: stageStats("stage1"), stage2a: stageStats("stage2a"), stage2c: stageStats("stage2c") },
    candidates: rows.rows.map((row) => ({
      id: row.application_id,
      name: row.name,
      status: row.application_status,
      stage1Score: row.stage1_score === null ? null : Number(row.stage1_score),
      stage2cScore: row.stage2c_score === null ? null : Number(row.stage2c_score),
      finalScore: row.stage2c_score === null ? (row.stage1_score === null ? null : Number(row.stage1_score)) : Number(row.stage2c_score),
      stage1Status: row.stage1_status as "COMPLETE" | "WAITING",
      stage2aStatus: row.stage2a_status as "COMPLETE" | "RUNNING" | "WAITING",
      stage2cStatus: row.stage2c_status as "COMPLETE" | "RUNNING" | "WAITING",
    })),
  };
}
