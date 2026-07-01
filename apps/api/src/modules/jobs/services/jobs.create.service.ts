import { withTransaction } from "../../../config/transaction";
import {
  assertMinimumRole,
  getActiveMembership,
} from "../../../helpers/membershipCheck";
import { createJobRecord } from "./helpers/createJobRecords";
import type { CreateJobInput } from "../jobs.validator";
import { createJobEligibilityCriteriaRecord } from "./helpers/eligibilityCriteria";
import type { JobEligibilityCriteriaInput } from "../jobs.validator";
import type { JobSubmissionRequirementsInput } from "../jobs.validator";
import { createJobSubmissionRequirementsRecord } from "./helpers/submissionRequirements";

export async function createJob(
  userId: string,
  orgId: string,
  jobData: CreateJobInput,
  eligibilityCriteriaData: JobEligibilityCriteriaInput,
  submissionRequirementsData: JobSubmissionRequirementsInput,
) {
  return withTransaction(async (client) => {
    const membership = await getActiveMembership(userId, orgId, client);
    assertMinimumRole(membership.role, "RECRUITER");

    const jobId = await createJobRecord(membership.id, orgId, jobData, client);
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
  });
}
