export declare function createTechnology(name: string, category: string | null): Promise<any>;
export declare function findTechnologyById(id: string): Promise<any>;
export declare function listTechnologies(limit: number, offset: number, search?: string, category?: string): Promise<any[]>;
export declare function updateTechnology(id: string, fields: {
    name?: string;
    category?: string | null;
}): Promise<any>;
export declare function deleteTechnology(id: string): Promise<any>;
//# sourceMappingURL=technology.repository.d.ts.map