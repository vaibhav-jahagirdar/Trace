import { withTransaction } from "../../../config/transaction";
import { getPublishedJobByPublicSlug } from "./helpers/getPublishedJob";
import { toPublicJobDto } from "./helpers/getJobDto";

export async function getPublicJob(orgSlug: string, jobSlug: string) {
  return withTransaction(async (client) => {
    const row = await getPublishedJobByPublicSlug(client, orgSlug, jobSlug);
    return toPublicJobDto(row);
  });
}

export async function resolvePublicJobId(orgSlug: string, jobSlug: string) {
  return withTransaction(async (client) => {
    const row = await getPublishedJobByPublicSlug(client, orgSlug, jobSlug);
    return row.id as string;
  });
}
