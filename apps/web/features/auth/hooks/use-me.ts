import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { getMe, type MeResponse } from "../api/me";

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    staleTime: 5 * 60 * 1000, 
    retry: false,            
  });
}