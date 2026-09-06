import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { cancelOrganizationDeletion, requestOrganizationDeletion, updateOrganization } from "../api/manage-org";

export function useManageOrg(orgId: string) {
  const queryClient = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(orgId) }),
    ]);
  };
  return {
    update: useMutation({ mutationFn: (payload: Parameters<typeof updateOrganization>[1]) => updateOrganization(orgId, payload), onSuccess: refresh }),
    requestDeletion: useMutation({ mutationFn: (payload: { password?: string; securityAnswer?: string }) => requestOrganizationDeletion(orgId, payload), onSuccess: refresh }),
    cancelDeletion: useMutation({ mutationFn: () => cancelOrganizationDeletion(orgId), onSuccess: refresh }),
  };
}
