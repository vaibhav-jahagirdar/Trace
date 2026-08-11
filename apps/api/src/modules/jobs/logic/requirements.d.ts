import { type JobRole } from "../constants/jobPolicy";
import type { JobRequirementInput, JobRequirementsInput } from "../validators/create/jobs.validator";
import { PoolClient } from "pg";
export type WeightedJobRequirementInput = JobRequirementInput & {
    weight: number;
};
export declare function getRole(roleCategoryId: string, client: PoolClient): Promise<JobRole>;
export declare function processJobRequirements(role: JobRole, requirements: JobRequirementsInput): WeightedJobRequirementInput[];
//# sourceMappingURL=requirements.d.ts.map