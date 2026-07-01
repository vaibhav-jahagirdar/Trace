import { PoolClient } from "pg";
import { getDb } from "../config/db";
import { ForbiddenError, UnauthorizedError } from "../middleware/errorHandler";
import { OrgRole } from "../modules/organizations/orgs.types";

export const roleHierarchy = {
  VIEWER: 0,
  INTERVIEWER: 1,
  HIRING_MANAGER: 2,
  RECRUITER: 3,
  RECRUITING_ADMIN: 4,
  ORG_OWNER: 5,
} as const;

export async function getActiveMembership(
  userId: string,
  organizationId: string,
  client?: PoolClient
) {
  const db = client ?? getDb();

  const result = await db.query(
    `
    SELECT
      id,
      user_id,
      organization_id,
      role,
      title
    FROM organization_members
    WHERE user_id = $1
      AND organization_id = $2
      AND removed_at IS NULL
    `,
    [userId, organizationId]
  );

  const membership = result.rows[0];

  if (!membership) {
    throw new UnauthorizedError(
      "No active membership found"
    );
  }

  return membership;
}

export function assertMinimumRole(
  role: OrgRole,
  minimumRole: OrgRole
) {
  if (
    roleHierarchy[role] <
    roleHierarchy[minimumRole]
  ) {
    throw new ForbiddenError(
      "Insufficient role privileges"
    );
  }
}