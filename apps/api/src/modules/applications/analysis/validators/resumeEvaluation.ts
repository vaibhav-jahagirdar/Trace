

import { z } from "zod";
import { CandidateExtractionOutput, CandidateExtractionOutputSchema } from "./candidateExtraction";
import {
  ComputedScoresSchema,
  ResumeEvaluationReportLLMOutputSchema,
} from "./evaluationReport";

export const ResumeAnalysisResponseSchema = z
  .object({
    candidate: CandidateExtractionOutputSchema,
    evaluation: ResumeEvaluationReportLLMOutputSchema,
    computed_scores: ComputedScoresSchema,
  })
  .strict();

export type ResumeAnalysisResponse = z.infer<
  typeof ResumeAnalysisResponseSchema
>;
