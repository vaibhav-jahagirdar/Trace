"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvidenceCategory = createEvidenceCategory;
exports.findEvidenceCategoryById = findEvidenceCategoryById;
exports.listEvidenceCategories = listEvidenceCategories;
exports.updateEvidenceCategory = updateEvidenceCategory;
exports.deleteEvidenceCategory = deleteEvidenceCategory;
exports.createEvaluationDimension = createEvaluationDimension;
exports.findEvaluationDimensionById = findEvaluationDimensionById;
exports.listEvaluationDimensions = listEvaluationDimensions;
exports.updateEvaluationDimension = updateEvaluationDimension;
exports.deleteEvaluationDimension = deleteEvaluationDimension;
exports.createSuccessSignal = createSuccessSignal;
exports.findSuccessSignalById = findSuccessSignalById;
exports.listSuccessSignals = listSuccessSignals;
exports.updateSuccessSignal = updateSuccessSignal;
exports.deleteSuccessSignal = deleteSuccessSignal;
const db_1 = require("../../config/db");
const pool = (0, db_1.getDb)();
async function createEvidenceCategory(code, name, description) {
    const result = await pool.query(`
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
    `, [code, name, description]);
    return result.rows[0];
}
async function findEvidenceCategoryById(id) {
    const result = await pool.query(`
      SELECT
        id,
        code,
        name,
        description,
        created_at
      FROM evidence_categories
      WHERE id = $1
    `, [id]);
    return result.rows[0] ?? null;
}
async function listEvidenceCategories(limit, offset, search) {
    const values = [];
    const conditions = [];
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
    const result = await pool.query(`
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
    `, values);
    return result.rows;
}
async function updateEvidenceCategory(id, fields) {
    const updates = [];
    const values = [];
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
    const result = await pool.query(`
      UPDATE evidence_categories
      SET ${updates.join(", ")}
      WHERE id = $${values.length}
      RETURNING
        id,
        code,
        name,
        description,
        created_at
    `, values);
    return result.rows[0] ?? null;
}
async function deleteEvidenceCategory(id) {
    const result = await pool.query(`
      DELETE FROM evidence_categories
      WHERE id = $1
      RETURNING id
    `, [id]);
    return result.rows[0] ?? null;
}
async function createEvaluationDimension(code, name, description) {
    const result = await pool.query(`
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
    `, [code, name, description]);
    return result.rows[0];
}
async function findEvaluationDimensionById(id) {
    const result = await pool.query(`
      SELECT
        id,
        code,
        name,
        description,
        created_at
      FROM evaluation_dimensions
      WHERE id = $1
    `, [id]);
    return result.rows[0] ?? null;
}
async function listEvaluationDimensions(limit, offset, search) {
    const values = [];
    const conditions = [];
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
    const result = await pool.query(`
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
    `, values);
    return result.rows;
}
async function updateEvaluationDimension(id, fields) {
    const updates = [];
    const values = [];
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
    const result = await pool.query(`
      UPDATE evaluation_dimensions
      SET ${updates.join(", ")}
      WHERE id = $${values.length}
      RETURNING
        id,
        code,
        name,
        description,
        created_at
    `, values);
    return result.rows[0] ?? null;
}
async function deleteEvaluationDimension(id) {
    const result = await pool.query(`
      DELETE FROM evaluation_dimensions
      WHERE id = $1
      RETURNING id
    `, [id]);
    return result.rows[0] ?? null;
}
async function createSuccessSignal(code, name, description) {
    const result = await pool.query(`
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
    `, [code, name, description]);
    return result.rows[0];
}
async function findSuccessSignalById(id) {
    const result = await pool.query(`
      SELECT
        id,
        code,
        name,
        description,
        created_at
      FROM success_signals
      WHERE id = $1
    `, [id]);
    return result.rows[0] ?? null;
}
async function listSuccessSignals(limit, offset, search) {
    const values = [];
    const conditions = [];
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
    const result = await pool.query(`
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
    `, values);
    return result.rows;
}
async function updateSuccessSignal(id, fields) {
    const updates = [];
    const values = [];
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
    const result = await pool.query(`
      UPDATE success_signals
      SET ${updates.join(", ")}
      WHERE id = $${values.length}
      RETURNING
        id,
        code,
        name,
        description,
        created_at
    `, values);
    return result.rows[0] ?? null;
}
async function deleteSuccessSignal(id) {
    const result = await pool.query(`
      DELETE FROM success_signals
      WHERE id = $1
      RETURNING id
    `, [id]);
    return result.rows[0] ?? null;
}
//# sourceMappingURL=evaluation-config.repository.js.map