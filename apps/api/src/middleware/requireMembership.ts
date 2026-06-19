import type { Request, Response, NextFunction } from "express";
import { ValidationError, UnauthorizedError } from "./errorHandler";
import { OrgRole } from "../modules/organizations/orgs.types";
import { getDb } from "../config/db";
import { ForbiddenError } from "./errorHandler";

export const roleHierarchy = {
  VIEWER: 0,
  INTERVIEWER: 1,
  HIRING_MANAGER: 2,
  RECRUITER: 3,
  RECRUITING_ADMIN: 4,
  ORG_OWNER: 5,
} as const;

export type OrgRoleHierarchy = keyof typeof roleHierarchy;

export function requireMembership(requiredRole?: OrgRole) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError("Authentication required");

      const orgIdParam = req.params.orgId;
      if (!orgIdParam) throw new ValidationError("Organization ID is required");
      if (Array.isArray(orgIdParam)) {
        throw new ValidationError("Organization ID must be a single value");
      }
      const orgId = orgIdParam; 

      const membershipResult = await getDb().query(
        `SELECT id, role, title
         FROM organization_members
         WHERE user_id = $1 AND organization_id = $2 AND removed_at IS NULL`,
        [userId, orgId],
      );

      const member = membershipResult.rows[0];
      if (!member) throw new UnauthorizedError("No active membership found");

      const { id, role, title } = member;

      if (requiredRole && roleHierarchy[role as OrgRole] < roleHierarchy[requiredRole]) {
        throw new ForbiddenError("Forbidden: Insufficient role privileges");
      }

      req.membership = { id, organizationId: orgId, userId, role, title };
      next();
    } catch (error) {
      next(error);
    }
  };
}