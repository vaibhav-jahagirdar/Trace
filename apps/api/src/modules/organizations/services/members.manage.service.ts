import type { PoolClient } from "pg";
import { withTransaction } from "../../../config/transaction";
import { getDb } from "../../../config/db";
import { AppError, ForbiddenError, NotFoundError, ValidationError } from "../../../middleware/errorHandler";
import { roleHierarchy } from "../../../helpers/membershipCheck";
import type { OrgRole } from "../orgs.types";

const MANAGEABLE_ROLES = ["RECRUITING_ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "VIEWER"] as const;
export type ManageableOrgRole = (typeof MANAGEABLE_ROLES)[number];

async function authorizeTarget(client: PoolClient, orgId: string, userId: string, membershipId: string) {
  const initiatorResult = await client.query(`SELECT om.id, om.role FROM organization_members om JOIN organizations o ON o.id = om.organization_id WHERE om.organization_id = $1 AND om.user_id = $2 AND om.removed_at IS NULL AND o.deleted_at IS NULL FOR UPDATE`, [orgId, userId]);
  const initiator = initiatorResult.rows[0];
  if (!initiator) throw new ForbiddenError("No active organization membership");
  const targetResult = await client.query(`SELECT id, user_id, role, removed_at FROM organization_members WHERE id = $1 AND organization_id = $2 FOR UPDATE`, [membershipId, orgId]);
  const target = targetResult.rows[0];
  if (!target || target.removed_at) throw new NotFoundError("Organization member");
  if (target.user_id === userId) throw new ForbiddenError("You cannot change or remove your own membership");
  if ((roleHierarchy[initiator.role as OrgRole] ?? -1) <= (roleHierarchy[target.role as OrgRole] ?? -1)) throw new ForbiddenError("Your role must be higher than the target member's role");
  return { initiator, target };
}

export async function listOrganizationMembers(orgId: string) {
  const result = await getDb().query(`SELECT om.id AS membership_id, om.user_id, om.role, om.title, om.joined_at, u.username, u.email FROM organization_members om JOIN users u ON u.id = om.user_id WHERE om.organization_id = $1 AND om.removed_at IS NULL ORDER BY CASE om.role WHEN 'ORG_OWNER' THEN 0 WHEN 'RECRUITING_ADMIN' THEN 1 WHEN 'RECRUITER' THEN 2 WHEN 'HIRING_MANAGER' THEN 3 WHEN 'INTERVIEWER' THEN 4 ELSE 5 END, om.joined_at ASC`, [orgId]);
  return result.rows;
}

export async function updateMemberRole(orgId: string, userId: string, membershipId: string, role: ManageableOrgRole) {
  if (!MANAGEABLE_ROLES.includes(role)) throw new ValidationError("Invalid organization role");
  return withTransaction(async (client) => {
    const { initiator, target } = await authorizeTarget(client, orgId, userId, membershipId);
    if ((roleHierarchy[initiator.role as OrgRole] ?? -1) <= (roleHierarchy[role as OrgRole] ?? -1)) throw new ForbiddenError("You cannot grant a role equal to or higher than your own");
    const result = await client.query(`UPDATE organization_members SET role = $1, updated_at = NOW() WHERE id = $2 AND removed_at IS NULL RETURNING id, role, updated_at`, [role, target.id]);
    return result.rows[0];
  });
}

export async function removeMember(orgId: string, userId: string, membershipId: string) {
  return withTransaction(async (client) => {
    const { target } = await authorizeTarget(client, orgId, userId, membershipId);
    const result = await client.query(`UPDATE organization_members SET removed_at = NOW(), updated_at = NOW() WHERE id = $1 AND removed_at IS NULL RETURNING id, removed_at`, [target.id]);
    return result.rows[0];
  });
}

export async function addExistingMember(orgId: string, userId: string, email: string, role: ManageableOrgRole) {
  if (!MANAGEABLE_ROLES.includes(role)) throw new ValidationError("Invalid organization role");
  return withTransaction(async (client) => {
    const initiatorResult = await client.query(`SELECT om.role FROM organization_members om JOIN organizations o ON o.id = om.organization_id WHERE om.organization_id = $1 AND om.user_id = $2 AND om.removed_at IS NULL AND o.deleted_at IS NULL FOR UPDATE`, [orgId, userId]);
    const initiator = initiatorResult.rows[0];
    if (!initiator) throw new ForbiddenError("No active organization membership");
    if ((roleHierarchy[initiator.role as OrgRole] ?? -1) <= (roleHierarchy[role as OrgRole] ?? -1)) throw new ForbiddenError("You cannot grant a role equal to or higher than your own");
    const userResult = await client.query(`SELECT id, username, email FROM users WHERE lower(email) = lower($1) AND status = 'ACTIVE' AND deleted_at IS NULL FOR SHARE`, [email]);
    const targetUser = userResult.rows[0];
    if (!targetUser) throw new NotFoundError("Active Trace user");
    if (targetUser.id === userId) throw new ForbiddenError("You cannot add yourself");
    const existing = await client.query(`SELECT id, removed_at FROM organization_members WHERE organization_id = $1 AND user_id = $2 FOR UPDATE`, [orgId, targetUser.id]);
    if (existing.rows[0]?.removed_at) {
      const restored = await client.query(`UPDATE organization_members SET role = $1, removed_at = NULL, joined_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING id, user_id, role, title, joined_at`, [role, existing.rows[0].id]);
      return restored.rows[0];
    }
    if (existing.rows[0]) throw new AppError("User is already a member of this organization", 409, "ORG_MEMBER_EXISTS");
    const result = await client.query(`INSERT INTO organization_members (organization_id, user_id, role, invited_by) VALUES ($1, $2, $3, $4) RETURNING id, user_id, role, title, joined_at`, [orgId, targetUser.id, role, userId]);
    return result.rows[0];
  });
}
