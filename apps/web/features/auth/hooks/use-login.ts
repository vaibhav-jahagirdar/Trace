import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login } from "../api/login";

import { queryKeys } from "@/lib/query/keys";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.me(),
      });
    },
  });
}