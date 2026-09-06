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
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    linkedin_url?: string | null;
    avatar_url?: string | null;
    organizations: OrgMembership[];
  };
}

export function updateMe(payload: Partial<Pick<MeResponse["data"], "username" | "first_name" | "last_name" | "phone" | "linkedin_url" | "avatar_url">>) {
  return api.patch<MeResponse>("/auth/me", payload);
}

export function getMe() {
  return api.get<MeResponse>(API.auth.me);
}
