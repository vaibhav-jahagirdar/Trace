import { randomUUID } from "crypto";

import { withTransaction } from "../../../../config/transaction";
import { validateResumeFile } from "../../../../helpers/fileValidation";
import { NotFoundError } from "../../../../middleware/errorHandler";
import { uploadResume } from "../../../../storage/r2.service";

import { ApplyJobBody } from "../validator";

import { getPublishedJob } from "../../../jobs/services/helpers/getPublishedJob";
import { toGetJobDto } from "../../../jobs/services/helpers/getJobDto";

import { createApplicationRecord } from "../../helpers/createApplication";
import { createEligibilityRecord } from "../../helpers/createEligibility";
import { createSubmissionRecord } from "../../helpers/createSubmission";
import {
  insertApplicationConcepts,
  insertApplicationTechnologies,
} from "../../helpers/createTechAndConcepts";
import { evaluateHardGate } from "../logic/evaluation";

export async function applyJob(
  file: Express.Multer.File,
  applicationData: ApplyJobBody,
  jobId: string,
  eligibilityData: ApplyJobBody["eligibility"],
  submissionData: ApplyJobBody["submission"],
) {
  validateResumeFile(file);

  const applicationId = randomUUID();

  const { objectKey, fileName, mimeType, fileSize, sha256 } =
    await uploadResume({
      applicationId,
      file,
    });

  return withTransaction(async (client) => {
    const jobRow = await getPublishedJob(client, jobId);

    if (!jobRow) {
      throw new NotFoundError("Job not found");
    }

    const jobResult = toGetJobDto(jobRow);

    await createApplicationRecord(
      client,
      applicationId,
      jobId,
      applicationData,
    );

    await createEligibilityRecord(client, applicationId, eligibilityData);

    await createSubmissionRecord(
      submissionData,
      client,
      applicationId,
      jobResult,
      objectKey,
      fileName,
      mimeType,
      fileSize,
      sha256,
    );

    await insertApplicationConcepts(
      client,
      applicationId,
      applicationData.concepts,
    );

    await insertApplicationTechnologies(
      client,
      applicationId,
      applicationData.technologies,
    );

    const hardGateResult = evaluateHardGate(jobResult, eligibilityData);

if (!hardGateResult.passed) {
  await client.query(
    `UPDATE job_applications
        SET status = 'REJECTED',
            rejection_source = 'SYSTEM',
            rejection_reason = $1,
            rejected_at = NOW()
      WHERE id = $2
        AND job_id = $3
        AND status <> 'REJECTED'`,
    [
      hardGateResult.primaryRejectionCode,
      applicationId,
      jobId,
    ],
  );

  return {
    applicationId,
    passed: false,
    taskId: null,
    taskType: null,
  };
}



const taskId = randomUUID();
const taskType = "RESUME_PARSE";

await client.query(
  `INSERT INTO application_tasks (
      id,
      job_application_id,
      task_type
    )
    VALUES ($1, $2, $3)`,
  [
    taskId,
    applicationId,
    taskType,
  ],
);

await client.query(
  `UPDATE job_applications
      SET status = 'QUEUED'
    WHERE id = $1`,
  [applicationId],
);

return {
  applicationId,
  passed: true,
  taskId,
  taskType,
};
    
    
  });
}
