"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJobRoleCategories = listJobRoleCategories;
exports.getJobRoleCategory = getJobRoleCategory;
exports.createJobRoleCategory = createJobRoleCategory;
exports.updateJobRoleCategory = updateJobRoleCategory;
exports.deleteJobRoleCategory = deleteJobRoleCategory;
const db_1 = require("../../../config/db");
const errorHandler_1 = require("../../../middleware/errorHandler");
const pool = (0, db_1.getDb)();
async function listJobRoleCategories() {
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
async function getJobRoleCategory(roleCategoryId) {
    const result = await pool.query(`
      SELECT
        id,
        code,
        name,
        description,
        created_at
      FROM job_role_categories
      WHERE id = $1
    `, [roleCategoryId]);
    if (result.rowCount === 0) {
        throw new errorHandler_1.NotFoundError("Job role category not found");
    }
    return result.rows[0];
}
async function createJobRoleCategory(data) {
    try {
        const result = await pool.query(`
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
      `, [
            data.code,
            data.name,
            data.description ?? null,
        ]);
        return result.rows[0];
    }
    catch (error) {
        if (error.code === "23505") {
            throw new errorHandler_1.ValidationError("A job role category with this code already exists.");
        }
        throw error;
    }
}
async function updateJobRoleCategory(roleCategoryId, data) {
    const fields = [];
    const values = [];
    if (data.code !== undefined) {
        fields.push(`code = $${values.length + 1}`);
        values.push(data.code);
    }
    if (data.name !== undefined) {
        fields.push(`name = $${values.length + 1}`);
        values.push(data.name);
    }
    if (data.description !== undefined) {
        fields.push(`description = $${values.length + 1}`);
        values.push(data.description);
    }
    if (fields.length === 0) {
        throw new errorHandler_1.ValidationError("At least one field must be provided.");
    }
    values.push(roleCategoryId);
    try {
        const result = await pool.query(`
        UPDATE job_role_categories
        SET ${fields.join(", ")}
        WHERE id = $${values.length}
        RETURNING
          id,
          code,
          name,
          description,
          created_at
      `, values);
        if (result.rowCount === 0) {
            throw new errorHandler_1.NotFoundError("Job role category not found");
        }
        return result.rows[0];
    }
    catch (error) {
        if (error.code === "23505") {
            throw new errorHandler_1.ValidationError("A job role category with this code already exists.");
        }
        throw error;
    }
}
async function deleteJobRoleCategory(roleCategoryId) {
    try {
        const result = await pool.query(`
        DELETE FROM job_role_categories
        WHERE id = $1
        RETURNING id
      `, [roleCategoryId]);
        if (result.rowCount === 0) {
            throw new errorHandler_1.NotFoundError("Job role category not found");
        }
        return {
            id: result.rows[0].id,
        };
    }
    catch (error) {
        if (error.code === "23503") {
            throw new errorHandler_1.ValidationError("This role category is already used by one or more jobs and cannot be deleted.");
        }
        throw error;
    }
}
//# sourceMappingURL=jobRoleCategory.service.js.map