export enum OrganizationRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  RECRUITER = "RECRUITER",
  REVIEWER = "REVIEWER",
}

export interface PermissionContext {
  role: OrganizationRole | null;
}

export function canCreateJob(ctx: PermissionContext) {
  return (
    ctx.role === OrganizationRole.OWNER ||
    ctx.role === OrganizationRole.ADMIN ||
    ctx.role === OrganizationRole.RECRUITER
  );
}

export function canPublishJob(ctx: PermissionContext) {
  return (
    ctx.role === OrganizationRole.OWNER ||
    ctx.role === OrganizationRole.ADMIN
  );
}

export function canInviteMembers(ctx: PermissionContext) {
  return (
    ctx.role === OrganizationRole.OWNER ||
    ctx.role === OrganizationRole.ADMIN
  );
}

export function canDeleteOrganization(ctx: PermissionContext) {
  return ctx.role === OrganizationRole.OWNER;
}

export function canViewCandidateAnalysis(
  ctx: PermissionContext
) {
  return ctx.role !== null;
}