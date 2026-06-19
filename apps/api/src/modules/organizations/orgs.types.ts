

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
export const OrgRole = {
  OWNER: "ORG_OWNER",
  RECRUITING_ADMIN: "RECRUITING_ADMIN",
  RECRUITER: "RECRUITER",
  HIRING_MANAGER: "HIRING_MANAGER",
  INTERVIEWER: "INTERVIEWER",
  VIEWER: "VIEWER",
} as const;

export type OrgRole = (typeof OrgRole)[keyof typeof OrgRole];