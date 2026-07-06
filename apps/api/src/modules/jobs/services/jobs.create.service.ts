import { withTransaction } from "../../../config/transaction";
import {
  assertMinimumRole,
  getActiveMembership,
} from "../../../helpers/membershipCheck";
import { createJobRecord } from "./helpers/createJobRecords";
import type { CreateJobInput, JobSuccessSignalsInput } from "../jobs.validator";
import { createJobEligibilityCriteriaRecord } from "./helpers/eligibilityCriteria";
import type { JobEligibilityCriteriaInput } from "../jobs.validator";
import type { JobSubmissionRequirementsInput } from "../jobs.validator";
import { createJobSubmissionRequirementsRecord } from "./helpers/submissionRequirements";
import { createJobRequirementRecord } from "./helpers/jobRequirements";
import { getRole } from "../logic/requirements";
import { processJobRequirements } from "../logic/requirements";
import type { JobRequirementsInput } from "../jobs.validator";
import { JobEvaluationPrioritiesInput } from "../jobs.validator";
import { processEvaluationPriorities } from "../logic/evaluation";
import { createJobEvaluationPriorityRecords } from "./helpers/evaluationRecord";
import { JobEvidencePrioritiesInput } from "../jobs.validator";
import { processEvidencePriorities } from "../logic/evidence";
import { createJobEvidencePriorityRecords } from "./helpers/evidenceRecord";
import { processSuccessSignals } from "../logic/success";
import { createSuccessSignalRecord } from "./helpers/successRecord";

export async function createJob(
  userId: string,
  orgId: string,
  jobData: CreateJobInput,
  eligibilityCriteriaData: JobEligibilityCriteriaInput,
  submissionRequirementsData: JobSubmissionRequirementsInput,
  requirements: JobRequirementsInput,
  evaluationPriorities: JobEvaluationPrioritiesInput,
  evidencePriorities: JobEvidencePrioritiesInput,
  successSignals : JobSuccessSignalsInput


) {
  return withTransaction(async (client) => {
    const membership = await getActiveMembership(userId, orgId, client);
    assertMinimumRole(membership.role, "RECRUITER");

    const {jobId, roleCategoryId} = await createJobRecord(membership.id, orgId, jobData, client);
    const eligibilityCriteriaId = await createJobEligibilityCriteriaRecord(
      eligibilityCriteriaData,
      jobId,
      client,
    );
    const submissionRequirementsId =
      await createJobSubmissionRequirementsRecord(
        submissionRequirementsData,
        jobId,
        client,
      );
      const role = await getRole(roleCategoryId);
      const weightedRequirements = processJobRequirements(role, requirements )
      const jobRequirementsId = await createJobRequirementRecord(
        weightedRequirements,
        jobId,
        client,
      )
      const evaluationRequirements = processEvaluationPriorities(role, evaluationPriorities)
      const evaluationPrioritiesId = await createJobEvaluationPriorityRecords(evaluationPriorities, jobId, client)
      const evidenceRequirements = processEvidencePriorities(role, evidencePriorities)
      const evidencePrioritiesId = await createJobEvidencePriorityRecords(evidencePriorities, jobId, client)
      const successSignalRequirements = processSuccessSignals(role, successSignals)
      const successSignalIds = await createSuccessSignalRecord(jobId, successSignals, client)
  });

}
