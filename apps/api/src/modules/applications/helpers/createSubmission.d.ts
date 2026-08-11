import { PoolClient } from "pg";
import { ApplyJobBody } from "../apply/validator";
import { toGetJobDto } from "../../jobs/services/helpers/getJobDto";
export declare function createSubmissionRecord(submissionData: ApplyJobBody["submission"], client: PoolClient, applicationId: string, jobResult: ReturnType<typeof toGetJobDto>, objectKey: string, fileName: string, mimeType: string, fileSize: number, sha256: string): Promise<void>;
//# sourceMappingURL=createSubmission.d.ts.map