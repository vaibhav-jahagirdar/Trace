"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTechnology = createTechnology;
exports.findTechnologyById = findTechnologyById;
exports.listTechnologies = listTechnologies;
exports.updateTechnology = updateTechnology;
exports.deleteTechnology = deleteTechnology;
const db_1 = require("../../config/db");
const pool = (0, db_1.getDb)();
async function createTechnology(name, category) {
    const result = await pool.query(`
      INSERT INTO technologies (name, category)
      VALUES ($1, $2)
      RETURNING id, name, category, created_at
    `, [name, category]);
    return result.rows[0];
}
async function findTechnologyById(id) {
    const result = await pool.query(`
      SELECT id, name, category, created_at
      FROM technologies
      WHERE id = $1
    `, [id]);
    return result.rows[0] ?? null;
}
async function listTechnologies(limit, offset, search, category) {
    const values = [];
    const conditions = [];
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
    const result = await pool.query(`
      SELECT id, name, category, created_at
      FROM technologies
      ${where}
      ORDER BY name ASC
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `, values);
    return result.rows;
}
async function updateTechnology(id, fields) {
    const updates = [];
    const values = [];
    if (fields.name !== undefined) {
        values.push(fields.name);
        updates.push(`name = $${values.length}`);
    }
    if (fields.category !== undefined) {
        values.push(fields.category);
        updates.push(`category = $${values.length}`);
    }
    values.push(id);
    const result = await pool.query(`
      UPDATE technologies
      SET ${updates.join(", ")}
      WHERE id = $${values.length}
      RETURNING id, name, category, created_at
    `, values);
    return result.rows[0] ?? null;
}
async function deleteTechnology(id) {
    const result = await pool.query(`
      DELETE FROM technologies
      WHERE id = $1
      RETURNING id
    `, [id]);
    return result.rows[0] ?? null;
}
//# sourceMappingURL=technology.repository.js.map