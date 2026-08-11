import { PoolClient } from "pg";
import { OrgRole } from "../modules/organizations/orgs.types";
export declare const roleHierarchy: {
    readonly VIEWER: 0;
    readonly INTERVIEWER: 1;
    readonly HIRING_MANAGER: 2;
    readonly RECRUITER: 3;
    readonly RECRUITING_ADMIN: 4;
    readonly ORG_OWNER: 5;
};
export declare function getActiveMembership(userId: string, organizationId: string, client?: PoolClient): Promise<any>;
export declare function assertMinimumRole(role: OrgRole, minimumRole: OrgRole): void;
//# sourceMappingURL=membershipCheck.d.ts.map