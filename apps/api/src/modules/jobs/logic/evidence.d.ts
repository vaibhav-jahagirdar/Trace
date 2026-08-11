import { JobRole } from "../constants/jobPolicy";
import type { JobEvidencePrioritiesInput } from "../validators/create/jobs.validator";
export declare function processEvidencePriorities(role: JobRole, evidencePriorities: JobEvidencePrioritiesInput): Promise<{
    evidence_category_id: string;
    weight: number;
}[]>;
//# sourceMappingURL=evidence.d.ts.map