import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrganization } from "../api/create-org";
import { queryKeys } from "@/lib/query/keys";

export function useCreateOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,

    onSuccess: async () => {
    
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.me(),
      });
    },
  });
}