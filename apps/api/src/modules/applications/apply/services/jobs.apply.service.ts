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
import { enqueueResumeAnalysis } from "../../../../queues/producer";

export async function applyJob(
  file: Express.Multer.File,
  applicationData: ApplyJobBody,
  jobId: string,
  eligibilityData: ApplyJobBody["eligibility"],
  submissionData: ApplyJobBody["submission"],
) {
  const startedAt = Date.now();
  console.log("[Apply][1] Received application", { applicationId: "pending", jobId });
  validateResumeFile(file);

  const applicationId = randomUUID();
  console.log("[Apply][2] Resume validated", { applicationId, jobId, fileName: file.originalname, fileSize: file.size });

  const { objectKey, fileName, mimeType, fileSize, sha256 } =
    await uploadResume({
      applicationId,
      file,
    });

  const result = await withTransaction(async (client) => {
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
    console.log("[Apply][3] Application record created", { applicationId, jobId });

    await createEligibilityRecord(client, applicationId, eligibilityData);
    console.log("[Apply][4] Eligibility persisted", { applicationId });

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
    console.log("[Apply][5] Submission persisted", { applicationId, resumeObjectKey: objectKey });

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
    console.log("[Apply][6] Hard gate evaluated", { applicationId, passed: hardGateResult.passed, code: hardGateResult.primaryRejectionCode });

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
    console.log("[Apply][7] Resume task created", { applicationId, taskId, taskType });

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

  if (result.passed) {
    console.log("[Apply][8] Enqueuing resume analysis", { applicationId: result.applicationId, taskId: result.taskId, jobId });
    const queuedJob = await enqueueResumeAnalysis({ taskId: result.taskId!, applicationId: result.applicationId, jobId });
    console.log("[Apply][9] Resume analysis enqueued", { applicationId: result.applicationId, taskId: result.taskId, queueJobId: queuedJob.id, elapsedMs: Date.now() - startedAt });
  }

  return result;
}
