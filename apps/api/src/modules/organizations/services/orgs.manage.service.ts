import bcrypt from "bcrypt";
import type { PoolClient } from "pg";
import { withTransaction } from "../../../config/transaction";
import { AppError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "../../../middleware/errorHandler";
import { assertMinimumRole } from "../../../helpers/membershipCheck";
import type { OrgRole } from "../orgs.types";
import type { UpdateOrganizationInput } from "../orgs.validator";

const configuredCooldown = Number(process.env.ORGANIZATION_DELETION_COOLDOWN_DAYS ?? 7);
const COOLDOWN_DAYS = Number.isFinite(configuredCooldown) && configuredCooldown >= 1 ? Math.floor(configuredCooldown) : 7;
const OWNERSHIP_TRANSFER_COOLDOWN_DAYS = 5;

async function owner(client: PoolClient, userId: string, orgId: string) {
  const result = await client.query(`SELECT om.id, om.role FROM organization_members om JOIN organizations o ON o.id = om.organization_id WHERE om.organization_id = $1 AND om.user_id = $2 AND om.removed_at IS NULL AND o.deleted_at IS NULL FOR UPDATE`, [orgId, userId]);
  const membership = result.rows[0];
  if (!membership) throw new UnauthorizedError("No active organization membership found");
  assertMinimumRole(membership.role as OrgRole, "ORG_OWNER");
  return membership;
}

export async function updateOrganization(orgId: string, userId: string, input: UpdateOrganizationInput) {
  return withTransaction(async (client) => {
    await owner(client, userId, orgId);
    const fields: string[] = [];
    const values: unknown[] = [];
    const set = (name: string, value: unknown) => { values.push(value); fields.push(`${name} = $${values.length}`); };
    if (input.name !== undefined) set("name", input.name);
    if (input.slug !== undefined) set("slug", input.slug);
    if (input.description !== undefined) set("description", input.description || null);
    if (input.securityQuestion !== undefined) {
      set("security_question", input.securityQuestion);
      set("security_answer_hash", await bcrypt.hash(input.securityAnswer!, 12));
    }
    if (!fields.length) throw new AppError("No organization changes supplied", 400, "ORG_NO_CHANGES");
    values.push(orgId);
    const result = await client.query(`UPDATE organizations SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${values.length} AND deleted_at IS NULL RETURNING id, name, slug, description, status, deletion_requested_at, deletion_scheduled_for`, values);
    if (!result.rows[0]) throw new NotFoundError("Organization not found");
    return result.rows[0];
  });
}

async function verifyDestructionFactor(client: PoolClient, userId: string, orgId: string, password?: string, answer?: string) {
  const result = await client.query(`SELECT o.security_answer_hash, a.password_hash FROM organizations o JOIN auth_accounts a ON a.user_id = $2 AND a.provider = 'PASSWORD' WHERE o.id = $1 AND o.deleted_at IS NULL`, [orgId, userId]);
  const row = result.rows[0];
  if (!row) throw new NotFoundError("Organization not found");
  const validPassword = password && row.password_hash ? await bcrypt.compare(password, row.password_hash) : false;
  const validAnswer = answer && row.security_answer_hash ? await bcrypt.compare(answer, row.security_answer_hash) : false;
  if (!validPassword && !validAnswer) throw new ForbiddenError("The password or security answer is incorrect");
}

export async function requestOrganizationDeletion(orgId: string, userId: string, password?: string, securityAnswer?: string) {
  return withTransaction(async (client) => {
    const membership = await owner(client, userId, orgId);
    await verifyDestructionFactor(client, userId, orgId, password, securityAnswer);
    const result = await client.query(`UPDATE organizations SET status = 'PENDING_DELETION', deletion_requested_at = COALESCE(deletion_requested_at, NOW()), deletion_scheduled_for = COALESCE(deletion_scheduled_for, NOW() + ($2 * INTERVAL '1 day')), updated_at = NOW() WHERE id = $1 AND status IN ('ACTIVE', 'SUSPENDED', 'PENDING_DELETION') AND deleted_at IS NULL RETURNING id, status, deletion_scheduled_for`, [orgId, COOLDOWN_DAYS]);
    if (!result.rows[0]) throw new AppError("Organization cannot enter deletion state", 409, "ORG_DELETION_UNAVAILABLE");
    await client.query(`UPDATE organization_security_actions SET status = 'PENDING', scheduled_for = $3, expires_at = $3, cancelled_at = NULL, cancelled_by_membership_id = NULL, updated_at = NOW() WHERE organization_id = $1 AND action_type = 'ORG_DELETION' AND status = 'PENDING'`, [orgId, membership.id, result.rows[0].deletion_scheduled_for]);
    const existing = await client.query(`SELECT id FROM organization_security_actions WHERE organization_id = $1 AND action_type = 'ORG_DELETION' AND status = 'PENDING' LIMIT 1`, [orgId]);
    if (!existing.rows[0]) await client.query(`INSERT INTO organization_security_actions (organization_id, initiated_by_membership_id, action_type, status, scheduled_for, expires_at) VALUES ($1, $2, 'ORG_DELETION', 'PENDING', $3, $3)`, [orgId, membership.id, result.rows[0].deletion_scheduled_for]);
    return result.rows[0];
  });
}

export async function cancelOrganizationDeletion(orgId: string, userId: string) {
  return withTransaction(async (client) => {
    const membership = await owner(client, userId, orgId);
    const result = await client.query(`UPDATE organizations SET status = 'ACTIVE', deletion_requested_at = NULL, deletion_scheduled_for = NULL, updated_at = NOW() WHERE id = $1 AND status = 'PENDING_DELETION' AND deleted_at IS NULL RETURNING id, status`, [orgId]);
    if (!result.rows[0]) throw new AppError("No pending deletion exists", 409, "ORG_NO_PENDING_DELETION");
    await client.query(`UPDATE organization_security_actions SET status = 'CANCELLED', cancelled_at = NOW(), cancelled_by_membership_id = $2, updated_at = NOW() WHERE organization_id = $1 AND action_type = 'ORG_DELETION' AND status = 'PENDING'`, [orgId, membership.id]);
    return result.rows[0];
  });
}

export async function processDueOrganizationDeletions() {
  const result = await withTransaction(async (client) => {
    const deleted = await client.query(`UPDATE organizations SET status = 'DELETED', deleted_at = NOW(), updated_at = NOW() WHERE status = 'PENDING_DELETION' AND deleted_at IS NULL AND deletion_scheduled_for <= NOW() RETURNING id`);
    if (deleted.rowCount) await client.query(`UPDATE organization_security_actions SET status = 'EXECUTED', executed_at = NOW(), updated_at = NOW() WHERE organization_id = ANY($1::uuid[]) AND action_type = 'ORG_DELETION' AND status = 'PENDING'`, [deleted.rows.map((row: { id: string }) => row.id)]);
    return deleted;
  });
  if (result.rowCount) console.log("[Organizations][deletion-processor] executed", { count: result.rowCount });
  return result.rowCount ?? 0;
}

export async function requestOwnershipTransfer(orgId: string, userId: string, targetMembershipId: string, password: string) {
  return withTransaction(async (client) => {
    const ownerMembership = await owner(client, userId, orgId);
    const account = await client.query(`SELECT password_hash FROM auth_accounts WHERE user_id = $1 AND provider = 'PASSWORD'`, [userId]);
    if (!account.rows[0]?.password_hash || !(await bcrypt.compare(password, account.rows[0].password_hash))) throw new ForbiddenError("The owner password is incorrect");
    const target = await client.query(`SELECT id, user_id, role FROM organization_members WHERE id = $1 AND organization_id = $2 AND removed_at IS NULL FOR UPDATE`, [targetMembershipId, orgId]);
    if (!target.rows[0]) throw new NotFoundError("Target organization member");
    if (target.rows[0].role !== "RECRUITING_ADMIN") throw new ValidationError("Ownership can only be transferred to a recruiting admin");
    const scheduled = new Date(Date.now() + OWNERSHIP_TRANSFER_COOLDOWN_DAYS * 86_400_000);
    const existing = await client.query(`SELECT id FROM organization_security_actions WHERE organization_id = $1 AND action_type = 'OWNERSHIP_TRANSFER' AND status = 'PENDING' FOR UPDATE`, [orgId]);
    if (existing.rows[0]) {
      await client.query(`UPDATE organization_security_actions SET target_membership_id = $2, scheduled_for = $3, expires_at = $3, initiated_by_membership_id = $4, updated_at = NOW() WHERE id = $1`, [existing.rows[0].id, targetMembershipId, scheduled, ownerMembership.id]);
    } else {
      await client.query(`INSERT INTO organization_security_actions (organization_id, initiated_by_membership_id, target_membership_id, action_type, status, scheduled_for, expires_at) VALUES ($1, $2, $3, 'OWNERSHIP_TRANSFER', 'PENDING', $4, $4)`, [orgId, ownerMembership.id, targetMembershipId, scheduled]);
    }
    return { organizationId: orgId, targetMembershipId, status: "PENDING", scheduledFor: scheduled };
  });
}

export async function cancelOwnershipTransfer(orgId: string, userId: string) {
  return withTransaction(async (client) => {
    const membership = await owner(client, userId, orgId);
    const result = await client.query(`UPDATE organization_security_actions SET status = 'CANCELLED', cancelled_at = NOW(), cancelled_by_membership_id = $2, updated_at = NOW() WHERE organization_id = $1 AND action_type = 'OWNERSHIP_TRANSFER' AND status = 'PENDING' RETURNING id`, [orgId, membership.id]);
    if (!result.rows[0]) throw new AppError("No pending ownership transfer exists", 409, "ORG_NO_PENDING_TRANSFER");
    return { status: "CANCELLED" };
  });
}

export async function processDueOwnershipTransfers() {
  return withTransaction(async (client) => {
    const actions = await client.query(`SELECT id, organization_id, initiated_by_membership_id, target_membership_id FROM organization_security_actions WHERE action_type = 'OWNERSHIP_TRANSFER' AND status = 'PENDING' AND scheduled_for <= NOW() ORDER BY scheduled_for FOR UPDATE SKIP LOCKED`);
    let executed = 0;
    for (const action of actions.rows) {
      const org = await client.query(`SELECT id FROM organizations WHERE id = $1 AND deleted_at IS NULL AND status = 'ACTIVE' FOR UPDATE`, [action.organization_id]);
      const target = await client.query(`SELECT id, role, removed_at FROM organization_members WHERE id = $1 AND organization_id = $2 FOR UPDATE`, [action.target_membership_id, action.organization_id]);
      const currentOwner = await client.query(`SELECT id, role FROM organization_members WHERE id = $1 AND organization_id = $2 AND removed_at IS NULL FOR UPDATE`, [action.initiated_by_membership_id, action.organization_id]);
      if (!org.rows[0] || !target.rows[0] || target.rows[0].removed_at || target.rows[0].role !== "RECRUITING_ADMIN" || !currentOwner.rows[0] || currentOwner.rows[0].role !== "ORG_OWNER") {
        await client.query(`UPDATE organization_security_actions SET status = 'FAILED', execution_error = 'Transfer prerequisites changed before execution', updated_at = NOW() WHERE id = $1`, [action.id]);
        continue;
      }
      await client.query(`UPDATE organization_members SET role = 'RECRUITING_ADMIN', updated_at = NOW() WHERE id = $1; UPDATE organization_members SET role = 'ORG_OWNER', updated_at = NOW() WHERE id = $2`, [action.initiated_by_membership_id, action.target_membership_id]);
      await client.query(`UPDATE organization_security_actions SET status = 'EXECUTED', executed_at = NOW(), updated_at = NOW() WHERE id = $1`, [action.id]);
      executed++;
    }
    if (executed) console.log("[Organizations][ownership-transfer-processor] executed", { count: executed });
    return executed;
  });
}
