import { randomUUID } from "crypto";
import type { JobsOptions } from "bullmq";

import { getDb } from "../config/db";

export interface PostgresQueueJob<T> {
  id: string;
  data: T;
  attemptsMade: number;
  opts: { attempts: number };
}

interface ClaimedRow {
  id: string;
  job_application_id: string;
  job_id: string;
  task_type: string;
  attempt_count: number;
  max_attempts: number;
}

function positiveNumber(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const LEASE_SECONDS = positiveNumber("POSTGRES_QUEUE_LEASE_SECONDS", 900);
const POLL_MS = positiveNumber("POSTGRES_QUEUE_POLL_MS", 1000);
const RETRY_BASE_SECONDS = positiveNumber("POSTGRES_QUEUE_RETRY_BASE_SECONDS", 5);
const RETRY_MAX_SECONDS = Math.max(RETRY_BASE_SECONDS, positiveNumber("POSTGRES_QUEUE_RETRY_MAX_SECONDS", 300));

export class PostgresTaskQueue<T extends { taskId: string; applicationId: string; jobId: string }> {
  constructor(
    private readonly queueName: string,
    private readonly taskType: string,
    private readonly workerId: string,
  ) {}

  get owner(): string {
    return this.workerId;
  }

  async enqueue(data: T, options?: JobsOptions): Promise<PostgresQueueJob<T>> {
    const attempts = Number(options?.attempts ?? 3);
    const delay = Number((options?.delay as number | undefined) ?? 0);
    const availableAt = new Date(Date.now() + delay);
    const db = getDb();
    const result = await db.query(
      `UPDATE application_tasks
       SET queue_name = $2,
           available_at = $3,
           next_retry_at = $3,
           max_attempts = GREATEST(max_attempts, $4),
           locked_by = NULL,
           locked_at = NULL,
           lease_expires_at = NULL,
           last_heartbeat_at = NULL,
           updated_at = NOW()
       WHERE id = $1
         AND task_type = $5
         AND status IN ('PENDING', 'RUNNING')
       RETURNING id`,
      [data.taskId, this.queueName, availableAt, attempts, this.taskType],
    );
    if (result.rowCount === 0) {
      throw new Error(`Cannot enqueue task ${data.taskId}: task is missing or terminal`);
    }
    console.log("[PostgresQueue][enqueue]", {
      queue: this.queueName,
      taskId: data.taskId,
      applicationId: data.applicationId,
      availableAt: availableAt.toISOString(),
      attempts,
    });
    return { id: data.taskId, data, attemptsMade: 0, opts: { attempts } };
  }

  async claim(): Promise<PostgresQueueJob<T> | null> {
    const db = getDb();
    const result = await db.query<ClaimedRow>(
      `WITH expired AS (
         UPDATE application_tasks
         SET locked_by = NULL,
             locked_at = NULL,
             lease_expires_at = NULL,
             last_heartbeat_at = NULL,
             status = CASE WHEN attempt_count >= max_attempts THEN 'FAILED' ELSE 'PENDING' END,
             human_intervention_required = CASE WHEN attempt_count >= max_attempts THEN TRUE ELSE human_intervention_required END,
             updated_at = NOW()
         WHERE queue_name = $1
           AND lease_expires_at IS NOT NULL
           AND lease_expires_at < NOW()
           AND status IN ('PENDING', 'RUNNING')
         RETURNING id
       ), claimed AS (
         SELECT t.id
         FROM application_tasks t
         WHERE t.queue_name = $1
           AND t.task_type = $2
           AND t.status = 'PENDING'
           AND t.available_at <= NOW()
           AND t.attempt_count < t.max_attempts
           AND t.human_intervention_required = FALSE
           AND (t.locked_by IS NULL OR t.lease_expires_at < NOW())
         ORDER BY t.available_at, t.created_at, t.id
         FOR UPDATE SKIP LOCKED
         LIMIT 1
       )
       UPDATE application_tasks t
       SET locked_by = $3,
           attempt_count = attempt_count + 1,
           locked_at = NOW(),
           lease_expires_at = NOW() + ($4 * INTERVAL '1 second'),
           last_heartbeat_at = NOW(),
           updated_at = NOW()
       FROM claimed c
       WHERE t.id = c.id
       RETURNING t.id, t.job_application_id,
                 (SELECT a.job_id FROM job_applications a WHERE a.id = t.job_application_id) AS job_id,
                 t.task_type, t.attempt_count, t.max_attempts`,
      [this.queueName, this.taskType, this.workerId, LEASE_SECONDS],
    );
    const row = result.rows[0];
    if (!row) return null;
    const data = {
      taskId: row.id,
      applicationId: row.job_application_id,
      jobId: row.job_id,
    } as T;
    console.log("[PostgresQueue][claim]", {
      queue: this.queueName,
      taskId: row.id,
      workerId: this.workerId,
      attempt: row.attempt_count,
      leaseSeconds: LEASE_SECONDS,
    });
    return {
      id: row.id,
      data,
      attemptsMade: row.attempt_count,
      opts: { attempts: row.max_attempts },
    };
  }

  async heartbeat(taskId: string): Promise<void> {
    await getDb().query(
      `UPDATE application_tasks
       SET lease_expires_at = NOW() + ($2 * INTERVAL '1 second'),
           last_heartbeat_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND locked_by = $3`,
      [taskId, LEASE_SECONDS, this.workerId],
    );
  }

  async acknowledge(taskId: string): Promise<void> {
    await getDb().query(
      `UPDATE application_tasks
       SET locked_by = NULL, locked_at = NULL, lease_expires_at = NULL,
           last_heartbeat_at = NULL, updated_at = NOW()
       WHERE id = $1 AND locked_by = $2`,
      [taskId, this.workerId],
    );
    console.log("[PostgresQueue][ack]", { queue: this.queueName, taskId, workerId: this.workerId });
  }

  async release(taskId: string, failed: boolean, attempt: number): Promise<void> {
    const delaySeconds = Math.min(RETRY_MAX_SECONDS, RETRY_BASE_SECONDS * 2 ** Math.max(0, attempt - 1));
    await getDb().query(
      `UPDATE application_tasks
       SET available_at = CASE WHEN $3 THEN NOW() + ($4 * INTERVAL '1 second') ELSE NOW() END,
           next_retry_at = CASE WHEN $3 THEN NOW() + ($4 * INTERVAL '1 second') ELSE NULL END,
           locked_by = NULL, locked_at = NULL, lease_expires_at = NULL,
           last_heartbeat_at = NULL, updated_at = NOW()
       WHERE id = $1 AND locked_by = $2`,
      [taskId, this.workerId, failed, delaySeconds],
    );
    console.log("[PostgresQueue][release]", { queue: this.queueName, taskId, failed, retryDelaySeconds: failed ? delaySeconds : 0 });
  }

  static workerId(prefix: string): string {
    return `${prefix}-${process.pid}-${randomUUID()}`;
  }

  static pollInterval(): number {
    return POLL_MS;
  }

  static heartbeatInterval(): number {
    return Math.max(10_000, Math.floor((LEASE_SECONDS * 1000) / 3));
  }
}
