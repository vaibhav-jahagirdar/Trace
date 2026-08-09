import { api } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";

import {
  type RegisterInput,
} from "@trace/shared/contracts/auth";

export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
}

export function register(payload: RegisterInput) {
  return api.post<RegisterResponse>(
    API.auth.signup,
    payload
  );
}