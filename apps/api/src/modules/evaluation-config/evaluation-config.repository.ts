import { getDb } from "../../config/db";
const pool = getDb();

type EvaluationConfigFields = {
  code?: string;
  name?: string;
  description?: string | null;
};

export async function createEvidenceCategory(
  code: string,
  name: string,
  description: string | null,
) {
  const result = await pool.query(
    `
      INSERT INTO evidence_categories (
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
    [code, name, description],
  );

  return result.rows[0];
}

export async function findEvidenceCategoryById(id: string) {
  const result = await pool.query(
    `
      SELECT
        id,
        code,
        name,
        description,
        created_at
      FROM evidence_categories
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function listEvidenceCategories(
  limit: number,
  offset: number,
  search?: string,
) {
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      (
        code ILIKE $${values.length}
        OR name ILIKE $${values.length}
      )
    `);
  }

  values.push(limit);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `
      SELECT
        id,
        code,
        name,
        description,
        created_at
      FROM evidence_categories
      ${where}
      ORDER BY name ASC
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function updateEvidenceCategory(
  id: string,
  fields: EvaluationConfigFields,
) {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (fields.code !== undefined) {
    values.push(fields.code);
    updates.push(`code = $${values.length}`);
  }

  if (fields.name !== undefined) {
    values.push(fields.name);
    updates.push(`name = $${values.length}`);
  }

  if (fields.description !== undefined) {
    values.push(fields.description);
    updates.push(`description = $${values.length}`);
  }

  values.push(id);

  const result = await pool.query(
    `
      UPDATE evidence_categories
      SET ${updates.join(", ")}
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

  return result.rows[0] ?? null;
}

export async function deleteEvidenceCategory(id: string) {
  const result = await pool.query(
    `
      DELETE FROM evidence_categories
      WHERE id = $1
      RETURNING id
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function createEvaluationDimension(
  code: string,
  name: string,
  description: string | null,
) {
  const result = await pool.query(
    `
      INSERT INTO evaluation_dimensions (
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
    [code, name, description],
  );

  return result.rows[0];
}

export async function findEvaluationDimensionById(id: string) {
  const result = await pool.query(
    `
      SELECT
        id,
        code,
        name,
        description,
        created_at
      FROM evaluation_dimensions
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function listEvaluationDimensions(
  limit: number,
  offset: number,
  search?: string,
) {
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      (
        code ILIKE $${values.length}
        OR name ILIKE $${values.length}
      )
    `);
  }

  values.push(limit);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `
      SELECT
        id,
        code,
        name,
        description,
        created_at
      FROM evaluation_dimensions
      ${where}
      ORDER BY name ASC
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function updateEvaluationDimension(
  id: string,
  fields: EvaluationConfigFields,
) {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (fields.code !== undefined) {
    values.push(fields.code);
    updates.push(`code = $${values.length}`);
  }

  if (fields.name !== undefined) {
    values.push(fields.name);
    updates.push(`name = $${values.length}`);
  }

  if (fields.description !== undefined) {
    values.push(fields.description);
    updates.push(`description = $${values.length}`);
  }

  values.push(id);

  const result = await pool.query(
    `
      UPDATE evaluation_dimensions
      SET ${updates.join(", ")}
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

  return result.rows[0] ?? null;
}

export async function deleteEvaluationDimension(id: string) {
  const result = await pool.query(
    `
      DELETE FROM evaluation_dimensions
      WHERE id = $1
      RETURNING id
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function createSuccessSignal(
  code: string,
  name: string,
  description: string | null,
) {
  const result = await pool.query(
    `
      INSERT INTO success_signals (
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
    [code, name, description],
  );

  return result.rows[0];
}

export async function findSuccessSignalById(id: string) {
  const result = await pool.query(
    `
      SELECT
        id,
        code,
        name,
        description,
        created_at
      FROM success_signals
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function listSuccessSignals(
  limit: number,
  offset: number,
  search?: string,
) {
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      (
        code ILIKE $${values.length}
        OR name ILIKE $${values.length}
      )
    `);
  }

  values.push(limit);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `
      SELECT
        id,
        code,
        name,
        description,
        created_at
      FROM success_signals
      ${where}
      ORDER BY name ASC
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function updateSuccessSignal(
  id: string,
  fields: EvaluationConfigFields,
) {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (fields.code !== undefined) {
    values.push(fields.code);
    updates.push(`code = $${values.length}`);
  }

  if (fields.name !== undefined) {
    values.push(fields.name);
    updates.push(`name = $${values.length}`);
  }

  if (fields.description !== undefined) {
    values.push(fields.description);
    updates.push(`description = $${values.length}`);
  }

  values.push(id);

  const result = await pool.query(
    `
      UPDATE success_signals
      SET ${updates.join(", ")}
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

  return result.rows[0] ?? null;
}

export async function deleteSuccessSignal(id: string) {
  const result = await pool.query(
    `
      DELETE FROM success_signals
      WHERE id = $1
      RETURNING id
    `,
    [id],
  );

  return result.rows[0] ?? null;
}
