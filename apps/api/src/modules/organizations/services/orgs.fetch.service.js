"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchOrganizationInfo = fetchOrganizationInfo;
const db_1 = require("../../../config/db");
const errorHandler_1 = require("../../../middleware/errorHandler");
const logger_1 = require("../../../lib/logger");
async function fetchOrganizationInfo(orgId) {
    let orgResult;
    try {
        orgResult = await (0, db_1.getDb)().query(`SELECT id, slug, name, description, status, credits, created_by, created_at, updated_at, deleted_at
       FROM organizations WHERE id = $1 AND deleted_at IS NULL`, [orgId]);
    }
    catch (error) {
        logger_1.logger.error({ err: error, orgId }, "org fetch query failed");
        throw new errorHandler_1.AppError("Failed to fetch organization info", 500, "ORG_FETCH_FAILED");
    }
    if (!orgResult || orgResult.rows.length === 0) {
        throw new errorHandler_1.AppError("Organization not found", 404, "ORG_NOT_FOUND");
    }
    const { id, slug, name, description, status, credits, created_by, created_at, updated_at, deleted_at } = orgResult.rows[0];
    return {
        id,
        slug,
        name,
        description,
        status,
        credits,
        created_by,
        created_at,
        updated_at,
        deleted_at
    };
}
//# sourceMappingURL=orgs.fetch.service.js.map