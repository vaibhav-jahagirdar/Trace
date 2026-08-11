import type { z } from "zod";
import { updateConceptSchema } from "./concept.schema";
type UpdateConceptInput = z.infer<typeof updateConceptSchema>;
export declare function createConcept(name: string, category: string | null): Promise<any>;
export declare function getConcept(id: string): Promise<any>;
export declare function listConcepts(limit: number, offset: number, search?: string, category?: string): Promise<any[]>;
export declare function updateConcept(id: string, fields: UpdateConceptInput): Promise<any>;
export declare function deleteConcept(id: string): Promise<any>;
export {};
//# sourceMappingURL=concept.service.d.ts.map