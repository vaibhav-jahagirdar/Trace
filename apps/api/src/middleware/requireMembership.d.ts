import type { Request, Response, NextFunction } from "express";
import { OrgRole } from "../modules/organizations/orgs.types";
import { roleHierarchy } from "../helpers/membershipCheck";
export type OrgRoleHierarchy = keyof typeof roleHierarchy;
export declare function requireMembership(requiredRole?: OrgRole): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=requireMembership.d.ts.map