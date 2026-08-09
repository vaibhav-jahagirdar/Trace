import { useMutation, useQueryClient } from "@tanstack/react-query";

import { register } from "../api/register";

import { queryKeys } from "@/lib/query/keys";

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.me(),
      });
    },
  });
}
