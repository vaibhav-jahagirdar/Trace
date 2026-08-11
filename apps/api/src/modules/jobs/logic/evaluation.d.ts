import type { JobEvaluationPrioritiesInput } from "../validators/create/jobs.validator";
import { JobRole } from "../constants/jobPolicy";
export declare function processEvaluationPriorities(role: JobRole, evaluationPriorities: JobEvaluationPrioritiesInput): {
    evaluation_dimension_id: string;
    weight: number;
}[];
//# sourceMappingURL=evaluation.d.ts.map