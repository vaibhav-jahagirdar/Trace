import { PoolClient } from "pg";
import { CandidateExtractionOutput } from "../../../validators/candidateExtraction";
import { ResumeEvaluationReport } from "../../../validators/evaluationReport";
export declare function persistCandidateAnalysis(client: PoolClient, resumeAnalysisId: string, jobApplicationId: string, candidate: CandidateExtractionOutput, evaluation: ResumeEvaluationReport): Promise<void>;
//# sourceMappingURL=persistCandidateAnalysis.d.ts.map