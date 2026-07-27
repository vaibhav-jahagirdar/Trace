
import { z } from "zod";
import { CandidateExtractionOutput, CandidateExtractionOutputSchema } from "./candidateExtraction";
import { ResumeEvaluationReportLLMOutputSchema } from "./evaluationReport";

export const ResumeAnalysisResponseSchema = z
  .object({
    candidate: CandidateExtractionOutputSchema,
    evaluation: ResumeEvaluationReportLLMOutputSchema,
    raw_llm_response: z.string().optional(),
  })
  .strict();

export type ResumeAnalysisResponse = z.infer<
  typeof ResumeAnalysisResponseSchema
>;