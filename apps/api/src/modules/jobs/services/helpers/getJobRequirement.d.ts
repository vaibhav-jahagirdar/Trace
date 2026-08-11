import { PoolClient } from "pg";
export interface JobRequirementRow {
    requirement_type: "TECHNOLOGY" | "CONCEPT";
    priority_type: "MANDATORY" | "PREFERRED" | "BONUS";
    weight: string;
    name: string;
    category: string | null;
}
export declare function getJobRequirements(client: PoolClient, jobId: string): Promise<JobRequirementRow[]>;
//# sourceMappingURL=getJobRequirement.d.ts.map