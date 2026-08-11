import { api } from "@/lib/api/client";

export const TECHNOLOGIES_ENDPOINT =
  "/v1/technologies";

export const CONCEPTS_ENDPOINT =
  "/v1/concepts";

export type RequirementLookupItem = {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
};

type LookupResponse = {
  data: RequirementLookupItem[];
};

export type RequirementLookups = {
  technologies: RequirementLookupItem[];
  concepts: RequirementLookupItem[];
};

export async function getRequirementLookups(): Promise<RequirementLookups> {
  const [technologies, concepts] = await Promise.all([
    getAllLookupItems(TECHNOLOGIES_ENDPOINT),
    getAllLookupItems(CONCEPTS_ENDPOINT),
  ]);

  return {
    technologies,
    concepts,
  };
}

async function getAllLookupItems(endpoint: string) {
  const pageSize = 100;
  const items: RequirementLookupItem[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const response = await api.get<LookupResponse>(
      `${endpoint}?limit=${pageSize}&offset=${offset}`,
    );
    items.push(...response.data);
    if (response.data.length < pageSize) return items;
  }
}
