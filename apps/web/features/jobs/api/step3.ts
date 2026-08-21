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

export async function getRequirementLookups(search?: string): Promise<RequirementLookups> {
  const [technologies, concepts] = await Promise.all([
    getAllLookupItems(TECHNOLOGIES_ENDPOINT, search),
    getAllLookupItems(CONCEPTS_ENDPOINT, search),
  ]);

  return {
    technologies,
    concepts,
  };
}

async function getAllLookupItems(endpoint: string, search?: string) {
  // Keep the client page size aligned with the API default/max contract.
  // This also avoids skipping records when an older API instance still caps at 50.
  const pageSize = 50;
  const items: RequirementLookupItem[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const params = new URLSearchParams({ limit: String(pageSize), offset: String(offset) });
    if (search?.trim()) {
      const normalized = search.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      // PostgreSQL is frequently stored as Postgres or Postgres SQL.
      params.set("search", normalized === "postgresql" || normalized === "postgres" ? "postgres" : search.trim());
    }
    const response = await api.get<LookupResponse>(`${endpoint}?${params.toString()}`);
    items.push(...response.data);
    if (response.data.length < pageSize) return items;
  }
}
