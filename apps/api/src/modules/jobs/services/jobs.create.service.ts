import { withTransaction } from "../../../config/transaction";
import {
  assertMinimumRole,
  getActiveMembership,
} from "../../../helpers/membershipCheck";
import { createJobRecord } from "./helpers/createJobRecords";
import type { CreateJobInput, JobSuccessSignalsInput } from "../validators/create/jobs.validator";
import { createJobEligibilityCriteriaRecord } from "./helpers/eligibilityCriteria";
import type { JobEligibilityCriteriaInput } from "../validators/create/jobs.validator";
import type { JobSubmissionRequirementsInput } from "../validators/create/jobs.validator";
import { createJobSubmissionRequirementsRecord } from "./helpers/submissionRequirements";
import { createJobRequirementRecord } from "./helpers/jobRequirements";
import { getRole } from "../logic/requirements";
import { processJobRequirements } from "../logic/requirements";
import type { JobRequirementsInput } from "../validators/create/jobs.validator";
import { JobEvaluationPrioritiesInput } from "../validators/create/jobs.validator";
import { processEvaluationPriorities } from "../logic/evaluation";
import { createJobEvaluationPriorityRecords } from "./helpers/evaluationRecord";
import { JobEvidencePrioritiesInput } from "../validators/create/jobs.validator";
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
  successSignals: JobSuccessSignalsInput,
) {
  return withTransaction(async (client) => {
    const membership = await getActiveMembership(userId, orgId, client);

    assertMinimumRole(membership.role, "RECRUITER");

    const { jobId, roleCategoryId } = await createJobRecord(
      membership.id,
      orgId,
      jobData,
      client,
    );

    await createJobEligibilityCriteriaRecord(
      eligibilityCriteriaData,
      jobId,
      client,
    );

    await createJobSubmissionRequirementsRecord(
      submissionRequirementsData,
      jobId,
      client,
    );

    const role = await getRole(roleCategoryId);

    const weightedRequirements = processJobRequirements(role, requirements);

    await createJobRequirementRecord(weightedRequirements, jobId, client);

    processEvaluationPriorities(role, evaluationPriorities);

    await createJobEvaluationPriorityRecords(
      evaluationPriorities,
      jobId,
      client,
    );

    processEvidencePriorities(role, evidencePriorities);

    await createJobEvidencePriorityRecords(evidencePriorities, jobId, client);

    processSuccessSignals(role, successSignals);

    await createSuccessSignalRecord(jobId, successSignals, client);

    return {
      jobId,
    };
  });
}
