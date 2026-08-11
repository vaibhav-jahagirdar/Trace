import { getDb } from "../../config/db";
const pool = getDb();

export async function createConcept(
  name: string,
  category: string | null,
) {
  const result = await pool.query(
    `
      INSERT INTO concepts (name, category)
      VALUES ($1, $2)
      RETURNING id, name, category, created_at
    `,
    [name, category],
  );

  return result.rows[0];
}

export async function findConceptById(id: string) {
  const result = await pool.query(
    `
      SELECT id, name, category, created_at
      FROM concepts
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function listConcepts(
  limit: number,
  offset: number,
  search?: string,
  category?: string,
) {
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`name ILIKE $${values.length}`);
  }

  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }

  values.push(limit);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await pool.query(
    `
      SELECT id, name, category, created_at
      FROM concepts
      ${where}
      ORDER BY name ASC
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function updateConcept(
  id: string,
  fields: {
    name?: string;
    category?: string | null;
  },
) {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (fields.name !== undefined) {
    values.push(fields.name);
    updates.push(`name = $${values.length}`);
  }

  if (fields.category !== undefined) {
    values.push(fields.category);
    updates.push(`category = $${values.length}`);
  }

  values.push(id);

  const result = await pool.query(
    `
      UPDATE concepts
      SET ${updates.join(", ")}
      WHERE id = $${values.length}
      RETURNING id, name, category, created_at
    `,
    values,
  );

  return result.rows[0] ?? null;
}

export async function deleteConcept(id: string) {
  const result = await pool.query(
    `
      DELETE FROM concepts
      WHERE id = $1
      RETURNING id
    `,
    [id],
  );

  return result.rows[0] ?? null;
}