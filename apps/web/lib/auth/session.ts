import { api } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";

export interface Session {
  id: string;
  email: string;
  name: string;
  organizationId: string | null;
  role: string | null;
}

export function getSession() {
  return api.get<Session>(API.auth.me);
}