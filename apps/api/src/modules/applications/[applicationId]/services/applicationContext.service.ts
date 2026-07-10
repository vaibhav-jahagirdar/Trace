import { withTransaction } from "../../../../config/transaction";
import { getApplicationForEvaluation } from "../helpers/getApplicationForEvaluation";
import { getApplicationTechnologies } from "../helpers/getApplicationTechnologies";
import { getApplicationConcepts } from "../helpers/getApplicationConcepts";
import { toApplicationContextDto } from "../helpers/toApplicationContextDto";

export async function getApplicationContext(applicationId: string) {
  return withTransaction(async (client) => {
    const application = await getApplicationForEvaluation(client, applicationId);

    const [technologies, concepts] = await Promise.all([
      getApplicationTechnologies(client, applicationId),
      getApplicationConcepts(client, applicationId),
    ]);

    return {
      jobId: application.job_id,
      resumeObjectKey: application.resume_object_key,
      context: toApplicationContextDto(
        application,
        technologies,
        concepts,
      ),
    };
  });
}