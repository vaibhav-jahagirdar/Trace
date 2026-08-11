import { EvaluationInput, JobContextInput, CandidateInput, ScoreResult } from './scoring.models';
export declare function computeResumeScores(jobContext: JobContextInput, llmOutput: {
    candidate?: CandidateInput;
    evaluation?: EvaluationInput;
}, candidateRef?: string): ScoreResult;
//# sourceMappingURL=scoring.service.d.ts.map