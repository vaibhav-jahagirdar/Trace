import { api } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";

import { type LoginInput } from "@trace/shared/contracts/auth";

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export function login(payload: LoginInput) {
  return api.post<LoginResponse>(API.auth.login, payload);
}