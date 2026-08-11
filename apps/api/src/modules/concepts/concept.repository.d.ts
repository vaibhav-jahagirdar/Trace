export declare function createConcept(name: string, category: string | null): Promise<any>;
export declare function findConceptById(id: string): Promise<any>;
export declare function listConcepts(limit: number, offset: number, search?: string, category?: string): Promise<any[]>;
export declare function updateConcept(id: string, fields: {
    name?: string;
    category?: string | null;
}): Promise<any>;
export declare function deleteConcept(id: string): Promise<any>;
//# sourceMappingURL=concept.repository.d.ts.map