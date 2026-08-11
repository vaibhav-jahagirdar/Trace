import { PoolClient } from "pg";
export interface ApplicationTechnologyRow {
    name: string;
    category: string | null;
}
export declare function getApplicationTechnologies(client: PoolClient, applicationId: string): Promise<ApplicationTechnologyRow[]>;
//# sourceMappingURL=getApplicationTechnologies.d.ts.map