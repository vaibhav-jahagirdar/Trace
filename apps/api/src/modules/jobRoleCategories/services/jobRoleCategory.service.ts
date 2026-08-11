import { getDb } from "../../../config/db";
import {
  NotFoundError,
  ValidationError,
} from "../../../middleware/errorHandler";

import type {
  CreateJobRoleCategoryInput,
  UpdateJobRoleCategoryInput,
} from "../validators/jobRoleCategory.validator";

const pool = getDb();

export async function listJobRoleCategories() {
  const result = await pool.query(`
    SELECT
      id,
      code,
      name,
      description,
      created_at
    FROM job_role_categories
    ORDER BY name ASC
  `);

  return result.rows;
}

export async function getJobRoleCategory(
  roleCategoryId: string,
) {
  const result = await pool.query(
    `
      SELECT
        id,
        code,
        name,
        description,
        created_at
      FROM job_role_categories
      WHERE id = $1
    `,
    [roleCategoryId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError(
      "Job role category not found",
    );
  }

  return result.rows[0];
}

export async function createJobRoleCategory(
  data: CreateJobRoleCategoryInput,
) {
  try {
    const result = await pool.query(
      `
        INSERT INTO job_role_categories (
          code,
          name,
          description
        )
        VALUES ($1, $2, $3)
        RETURNING
          id,
          code,
          name,
          description,
          created_at
      `,
      [
        data.code,
        data.name,
        data.description ?? null,
      ],
    );

    return result.rows[0];
  } catch (error: any) {
    if (error.code === "23505") {
      throw new ValidationError(
        "A job role category with this code already exists.",
      );
    }

    throw error;
  }
}

export async function updateJobRoleCategory(
  roleCategoryId: string,
  data: UpdateJobRoleCategoryInput,
) {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.code !== undefined) {
    fields.push(`code = $${values.length + 1}`);
    values.push(data.code);
  }

  if (data.name !== undefined) {
    fields.push(`name = $${values.length + 1}`);
    values.push(data.name);
  }

  if (data.description !== undefined) {
    fields.push(
      `description = $${values.length + 1}`,
    );
    values.push(data.description);
  }

  if (fields.length === 0) {
    throw new ValidationError(
      "At least one field must be provided.",
    );
  }

  values.push(roleCategoryId);

  try {
    const result = await pool.query(
      `
        UPDATE job_role_categories
        SET ${fields.join(", ")}
        WHERE id = $${values.length}
        RETURNING
          id,
          code,
          name,
          description,
          created_at
      `,
      values,
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(
        "Job role category not found",
      );
    }

    return result.rows[0];
  } catch (error: any) {
    if (error.code === "23505") {
      throw new ValidationError(
        "A job role category with this code already exists.",
      );
    }

    throw error;
  }
}

export async function deleteJobRoleCategory(
  roleCategoryId: string,
) {
  try {
    const result = await pool.query(
      `
        DELETE FROM job_role_categories
        WHERE id = $1
        RETURNING id
      `,
      [roleCategoryId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(
        "Job role category not found",
      );
    }

    return {
      id: result.rows[0].id,
    };
  } catch (error: any) {
    if (error.code === "23503") {
      throw new ValidationError(
        "This role category is already used by one or more jobs and cannot be deleted.",
      );
    }

    throw error;
  }
}