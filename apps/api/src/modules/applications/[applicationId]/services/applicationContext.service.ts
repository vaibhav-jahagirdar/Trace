import { withTransaction } from "../../../../config/transaction";
import { getApplicationForEvaluation } from "../helpers/getApplicationForEvaluation";
import { getApplicationTechnologies } from "../helpers/getApplicationTechnologies";
import { getApplicationConcepts } from "../helpers/getApplicationConcepts";
import { toApplicationContextDto } from "../helpers/toApplicationContextDto";

export async function getApplicationContext(applicationId: string) {
  return withTransaction(async (client) => {
    const application = await getApplicationForEvaluation(client, applicationId);

    // A single pg client cannot safely execute concurrent queries. Keep these
    // lookups sequential so analysis payload construction is deterministic.
    const technologies = await getApplicationTechnologies(client, applicationId);
    const concepts = await getApplicationConcepts(client, applicationId);

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
