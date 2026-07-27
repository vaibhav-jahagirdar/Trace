import { PoolClient } from "pg";
import { getJob } from "../../../../jobs/services/[jobId]/job.get.service";
import { claimResumeParseTask } from "./helpers/validateCvAnalysisRequest";
import { analyzeResume } from "../client/analysis.client";

export async function resumeAnalysis(
    jobId: string,
    applicationId: string,
    taskId: string,
    client: PoolClient
) {
   
    const claimed = await claimResumeParseTask(client, taskId);
    const result = await analyzeResume(jobId, applicationId, taskId);
    const { candidate, evaluation, raw_llm_response } = result;

  
   
}