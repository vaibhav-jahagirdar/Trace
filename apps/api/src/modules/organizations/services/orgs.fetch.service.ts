import { Organization } from "../orgs.types";
import { getDb } from "../../../config/db";
import { AppError } from "../../../middleware/errorHandler";
import { logger } from "../../../lib/logger";

export async function fetchOrganizationInfo(orgId: string): Promise<Organization> {
  let orgResult;
  try {
    orgResult = await getDb().query(
      `SELECT id, slug, name, description, status, credits, created_by, created_at, updated_at, deleted_at
       FROM organizations WHERE id = $1 AND deleted_at IS NULL`,
      [orgId],
    );
  } catch (error) {
    logger.error({ err: error, orgId }, "org fetch query failed");
    throw new AppError("Failed to fetch organization info", 500, "ORG_FETCH_FAILED");
  }

  if (!orgResult || orgResult.rows.length === 0) {
    throw new AppError("Organization not found", 404, "ORG_NOT_FOUND");
  }

  const {id, slug, name, description, status, credits, created_by, created_at, updated_at, deleted_at} = orgResult.rows[0];

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