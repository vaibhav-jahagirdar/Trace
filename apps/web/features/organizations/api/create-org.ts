import { api } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { CreateOrganizationInput } from "@trace/shared/contracts/organizations";

export interface CreateOrgResponse {
  data: {
    organizationId: string;
    membershipId: string;
  };
}

export function createOrganization(payload: CreateOrganizationInput) {
  return api.post<CreateOrgResponse>(API.organizations.create, payload);
}