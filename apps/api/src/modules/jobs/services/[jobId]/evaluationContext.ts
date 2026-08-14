import { withTransaction } from "../../../../config/transaction";
import { getJobForEvaluation } from "../helpers/getJobForEvaluation";
import { getJobRequirements } from "../helpers/getJobRequirement";
import { getJobEvaluationPriorities } from "../helpers/getJobEvaluationPriorities";
import { getJobEvidencePriorities } from "../helpers/getJobEvidencePriorities";
import { getJobSuccessSignals } from "../helpers/getJobSuccessSignals";
import { toEvaluationContextDto } from "../helpers/toEvaluationContextDto";

export async function getEvaluationContext(jobId: string) {
  return withTransaction(async (client) => {

    const job = await getJobForEvaluation(client, jobId);

    // pg clients execute one query at a time; keep these lookups sequential
    // rather than racing queries on the same transaction client.
    const requirements = await getJobRequirements(client, jobId);
    const evaluationPriorities = await getJobEvaluationPriorities(client, jobId);
    const evidencePriorities = await getJobEvidencePriorities(client, jobId);
    const successSignals = await getJobSuccessSignals(client, jobId);

    return toEvaluationContextDto(
      job,
      requirements,
      evaluationPriorities,
      evidencePriorities,
      successSignals,
    );
  });
}
