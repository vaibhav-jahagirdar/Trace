import { withTransaction } from "../../../../config/transaction";
import { getPublishedJob } from "../helpers/getPublishedJob";
import { toGetJobDto } from "../helpers/getJobDto";

export async function getJob(jobId: string) {
  return withTransaction(async (client) => {
    const job = await getPublishedJob(client, jobId);

    return toGetJobDto(job);
  });
}