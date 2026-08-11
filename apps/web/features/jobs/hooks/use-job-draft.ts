import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDraft, saveDraft, submitJob, type SubmitJobPayload } from "../api/create-job"
import { queryKeys } from "@/lib/query/keys";

// ── Get draft ──────────────────────────────────────
export function useGetDraft(orgId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.jobs.draft(orgId!),
    queryFn: async () => {
      const res = await getDraft(orgId!);
   
      return res.draft;
    },
    enabled: !!orgId,
    staleTime: 30_000,
  });
}


export function useSaveDraft(orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { formData: Record<string, unknown>; currentStep: number }) =>
      saveDraft(orgId!, data),
    onSuccess: (res) => {
 
      queryClient.setQueryData(queryKeys.jobs.draft(orgId!), res.draft);
    },
  });
}


export function useSubmitJob(orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitJobPayload) => submitJob(orgId!, payload),
    onSuccess: (data) => {
     
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.list(orgId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.draft(orgId!) });
    },
  });
}