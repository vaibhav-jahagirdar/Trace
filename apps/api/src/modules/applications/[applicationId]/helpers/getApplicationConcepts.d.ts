import { PoolClient } from "pg";
export interface ApplicationConceptRow {
    name: string;
    category: string | null;
}
export declare function getApplicationConcepts(client: PoolClient, applicationId: string): Promise<ApplicationConceptRow[]>;
//# sourceMappingURL=getApplicationConcepts.d.ts.map