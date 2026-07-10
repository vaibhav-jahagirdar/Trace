import { getApplicationContext } from "../../../[applicationId]/services/applicationContext.service";
import { getEvaluationContext } from "../../../../jobs/services/[jobId]/evaluationContext";

export async function getResumeAnalysisPayload(
  applicationId: string,
  taskId: string,
) {
  const application = await getApplicationContext(applicationId);

  const job = await getEvaluationContext(application.jobId);

  return {
    applicationId,
    taskId,
    resumeObjectKey: application.resumeObjectKey,
    analysisContext: {
      job,
      candidate: application.context,
    },
  };
}