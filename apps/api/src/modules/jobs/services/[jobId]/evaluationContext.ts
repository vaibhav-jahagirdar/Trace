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

    const [requirements, evaluationPriorities, evidencePriorities, successSignals] =
      await Promise.all([
        getJobRequirements(client, jobId),
        getJobEvaluationPriorities(client, jobId),
        getJobEvidencePriorities(client, jobId),
        getJobSuccessSignals(client, jobId),
      ]);

    return toEvaluationContextDto(
      job,
      requirements,
      evaluationPriorities,
      evidencePriorities,
      successSignals,
    );
  });
}