import { PoolClient } from "pg";
export declare function insertApplicationConcepts(client: PoolClient, applicationId: string, concepts: string[]): Promise<void>;
export declare function insertApplicationTechnologies(client: PoolClient, applicationId: string, technologies: string[]): Promise<void>;
//# sourceMappingURL=createTechAndConcepts.d.ts.map