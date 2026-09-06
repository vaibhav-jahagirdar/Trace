import { api } from "@/lib/api/client";
export type OrganizationMember = { membership_id: string; user_id: string; role: string; title: string | null; username: string; email: string; joined_at: string };
export function getOrganizationMembers(orgId: string) { return api.get<{ data: OrganizationMember[] }>(`/organizations/${orgId}/members`); }
export function updateMemberRole(orgId: string, membershipId: string, role: string) { return api.patch(`/organizations/${orgId}/members/${membershipId}`, { role }); }
export function removeMember(orgId: string, membershipId: string) { return api.delete(`/organizations/${orgId}/members/${membershipId}`); }
export function addMember(orgId: string, email: string, role: string) { return api.post(`/organizations/${orgId}/members`, { email, role }); }
