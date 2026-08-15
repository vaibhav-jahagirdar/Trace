import { getDb } from "../../../config/db";

export type JobListStatus = "ALL" | "PUBLISHED" | "DRAFT" | "PAUSED" | "CLOSED";
export type JobListSort = "UPDATED" | "CREATED" | "TITLE";

export interface JobListQuery {
  status: JobListStatus;
  search?: string | undefined;
  department?: string | undefined;
  role?: string | undefined;
  workMode?: string | undefined;
  employmentType?: string | undefined;
  sort: JobListSort;
}

export interface JobPipelineKpis {
  applications: number;
  eligible: number;
  evidenceReviewed: number;
  shortlisted: number;
  interviewing: number;
}

export interface OrganizationJobRow {
  id: string;
  title: string;
  department: string | null;
  role: string | null;
  status: Exclude<JobListStatus, "ALL">;
  employmentType: string;
  workMode: string;
  openPositions: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  closedAt: string | null;
  kpis: JobPipelineKpis;
}

export interface OrganizationJobDraft {
  id: string;
  title: string;
  currentStep: number;
  updatedAt: string;
}

export interface OrganizationJobsResult {
  summary: {
    all: number;
    active: number;
    drafts: number;
    paused: number;
    closed: number;
  };
  jobs: OrganizationJobRow[];
  drafts: OrganizationJobDraft[];
}

const STATUS_VALUES = new Set<JobListStatus>([
  "ALL",
  "PUBLISHED",
  "DRAFT",
  "PAUSED",
  "CLOSED",
]);

function normalizeStatus(value: string | undefined): JobListStatus {
  const normalized = value?.toUpperCase() as JobListStatus | undefined;
  return normalized && STATUS_VALUES.has(normalized) ? normalized : "ALL";
}

function normalizeSort(value: string | undefined): JobListSort {
  const normalized = value?.toUpperCase() as JobListSort | undefined;
  return normalized === "CREATED" || normalized === "TITLE"
    ? normalized
    : "UPDATED";
}

export async function listOrganizationJobs(
  organizationId: string,
  rawQuery: Partial<JobListQuery> = {},
): Promise<OrganizationJobsResult> {
  const query: JobListQuery = {
    status: normalizeStatus(rawQuery.status),
    sort: normalizeSort(rawQuery.sort),
    search: rawQuery.search?.trim() || undefined,
    department: rawQuery.department?.trim() || undefined,
    role: rawQuery.role?.trim() || undefined,
    workMode: rawQuery.workMode?.trim() || undefined,
    employmentType: rawQuery.employmentType?.trim() || undefined,
  };

  const db = getDb();
  const values: unknown[] = [organizationId];
  const conditions = ["j.organization_id = $1", "j.deleted_at IS NULL"];

  function addCondition(sql: string, value: unknown): void {
    values.push(value);
    conditions.push(sql.replace("?", `$${values.length}`));
  }

  if (query.status !== "ALL") addCondition("j.status = ?", query.status);
  if (query.search) {
    const pattern = `%${query.search}%`;
    const titleParam = values.push(pattern);
    const departmentParam = values.push(pattern);
    const roleParam = values.push(pattern);
    conditions.push(
      `(j.title ILIKE $${titleParam} OR COALESCE(j.department, '') ILIKE $${departmentParam} OR rc.name ILIKE $${roleParam})`,
    );
  }
  if (query.department) addCondition("j.department = ?", query.department);
  if (query.role) {
    const codeParam = values.push(query.role);
    const nameParam = values.push(query.role);
    conditions.push(`(rc.code = $${codeParam} OR rc.name = $${nameParam})`);
  }
  if (query.workMode) addCondition("j.work_mode = ?", query.workMode);
  if (query.employmentType) addCondition("j.employment_type = ?", query.employmentType);

  const orderBy =
    query.sort === "TITLE"
      ? "j.title ASC, j.updated_at DESC"
      : query.sort === "CREATED"
        ? "j.created_at DESC"
        : "j.updated_at DESC";

  const jobsResult = await db.query<{
    id: string;
    title: string;
    department: string | null;
    role: string | null;
    status: Exclude<JobListStatus, "ALL">;
    employment_type: string;
    work_mode: string;
    open_positions: number;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    closed_at: string | null;
    applications: string;
    eligible: string;
    evidence_reviewed: string;
    shortlisted: string;
    interviewing: string;
  }>(
    `
    SELECT
      j.id,
      j.title,
      j.department,
      rc.name AS role,
      j.status,
      j.employment_type,
      j.work_mode,
      j.open_positions,
      j.created_at,
      j.updated_at,
      j.published_at,
      j.closed_at,
      COUNT(DISTINCT ja.id)::text AS applications,
      COUNT(DISTINCT ja.id) FILTER (
        WHERE ja.status NOT IN ('REJECTED', 'WITHDRAWN')
      )::text AS eligible,
      COUNT(DISTINCT ja.id) FILTER (
        WHERE EXISTS (
          SELECT 1
          FROM application_repository_verifier_runs vr
          JOIN application_repository_analyses ra
            ON ra.id = vr.application_repository_analysis_id
          JOIN application_tasks planner_task
            ON planner_task.id = ra.application_task_id
          WHERE planner_task.job_application_id = ja.id
            AND planner_task.task_type = 'REPOSITORY_PLAN'
            AND vr.status = 'COMPLETED'
        )
      )::text AS evidence_reviewed,
      COUNT(DISTINCT ja.id) FILTER (
        WHERE ja.status IN ('SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED')
      )::text AS shortlisted,
      COUNT(DISTINCT ja.id) FILTER (
        WHERE ja.status = 'INTERVIEW'
      )::text AS interviewing
    FROM jobs j
    LEFT JOIN job_role_categories rc ON rc.id = j.role_category_id
    LEFT JOIN job_applications ja ON ja.job_id = j.id
    WHERE ${conditions.join(" AND ")}
    GROUP BY j.id, rc.name
    ORDER BY ${orderBy}
    `,
    values,
  );

  const summaryResult = await db.query<{
    active: string;
    paused: string;
    closed: string;
    job_drafts: string;
  }>(
    `
    SELECT
      COUNT(*) FILTER (WHERE j.status = 'PUBLISHED')::text AS active,
      COUNT(*) FILTER (WHERE j.status = 'PAUSED')::text AS paused,
      COUNT(*) FILTER (WHERE j.status = 'CLOSED')::text AS closed,
      (
        COUNT(*) FILTER (WHERE j.status = 'DRAFT') +
        (
          SELECT COUNT(*)
          FROM job_drafts d
          WHERE d.org_id = $1 AND d.status = 'DRAFT'
        )
      )::text AS job_drafts
    FROM jobs j
    WHERE j.organization_id = $1 AND j.deleted_at IS NULL
    `,
    [organizationId],
  );

  const draftsResult = await db.query<{
    id: string;
    form_data: Record<string, unknown>;
    current_step: number;
    updated_at: string;
  }>(
    `
    SELECT id, form_data, current_step, updated_at
    FROM job_drafts
    WHERE org_id = $1 AND status = 'DRAFT'
    ORDER BY updated_at DESC
    `,
    [organizationId],
  );

  const summaryRow = summaryResult.rows[0];
  const active = Number(summaryRow?.active ?? 0);
  const drafts = Number(summaryRow?.job_drafts ?? 0);
  const paused = Number(summaryRow?.paused ?? 0);
  const closed = Number(summaryRow?.closed ?? 0);

  return {
    summary: { all: active + drafts + paused + closed, active, drafts, paused, closed },
    jobs: jobsResult.rows.map((row) => ({
      id: row.id,
      title: row.title,
      department: row.department,
      role: row.role,
      status: row.status,
      employmentType: row.employment_type,
      workMode: row.work_mode,
      openPositions: Number(row.open_positions),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at,
      closedAt: row.closed_at,
      kpis: {
        applications: Number(row.applications),
        eligible: Number(row.eligible),
        evidenceReviewed: Number(row.evidence_reviewed),
        shortlisted: Number(row.shortlisted),
        interviewing: Number(row.interviewing),
      },
    })),
    drafts: draftsResult.rows.map((row) => ({
      id: row.id,
      title: typeof row.form_data?.title === "string" ? row.form_data.title : "Untitled role",
      currentStep: Number(row.current_step),
      updatedAt: row.updated_at,
    })),
  };
}
