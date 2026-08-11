export type OrgStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type Organization = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    status: OrgStatus;
    credits: number;
    created_by: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
};
export type CreateOrgResult = {
    orgId: string;
    name: string;
    slug: string;
};
export type OrgRow = Organization;
export type PaginatedOrgs = {
    data: Pick<Organization, "id" | "name" | "slug" | "description" | "status" | "credits" | "created_at">[];
    total: number;
    page: number;
    limit: number;
};
export declare const OrgRole: {
    readonly OWNER: "ORG_OWNER";
    readonly RECRUITING_ADMIN: "RECRUITING_ADMIN";
    readonly RECRUITER: "RECRUITER";
    readonly HIRING_MANAGER: "HIRING_MANAGER";
    readonly INTERVIEWER: "INTERVIEWER";
    readonly VIEWER: "VIEWER";
};
export type OrgRole = (typeof OrgRole)[keyof typeof OrgRole];
//# sourceMappingURL=orgs.types.d.ts.map