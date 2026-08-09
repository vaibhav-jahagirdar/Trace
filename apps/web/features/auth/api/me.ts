import { api } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";



export interface OrgMembership {
  orgId: string;
  orgSlug: string;
  orgName: string;
  role: string;        
  title?: string;
  joinedAt: string;
}

export interface MeResponse {
  data: {
    id: string;
    username: string;
    email: string;
    status: string;
    created_at: string;
    updated_at: string;
    organizations: OrgMembership[];
  };
}

export function getMe() {
  return api.get<MeResponse>(API.auth.me);
}