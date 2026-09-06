import { api } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { UpdateOrganizationInput } from "@trace/shared/contracts/organizations";

export function updateOrganization(orgId: string, payload: UpdateOrganizationInput) {
  return api.patch(API.organizations.detail(orgId), payload);
}
export function requestOrganizationDeletion(orgId: string, payload: { password?: string; securityAnswer?: string }) {
  return api.post(API.organizations.deletionRequest(orgId), payload);
}
export function cancelOrganizationDeletion(orgId: string) {
  return api.post(API.organizations.deletionCancel(orgId));
}
