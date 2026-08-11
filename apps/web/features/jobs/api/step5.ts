import { api } from "@/lib/api/client";

export const EVIDENCE_CATEGORIES_ENDPOINT =
  "/v1/evidence-categories";

export type EvidenceCategory = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

type EvidenceCategoriesResponse = {
  data: EvidenceCategory[];
};

export async function getEvidenceCategories(): Promise<
  EvidenceCategory[]
> {
  const response =
    await api.get<EvidenceCategoriesResponse>(
      EVIDENCE_CATEGORIES_ENDPOINT,
    );

  return response.data;
}