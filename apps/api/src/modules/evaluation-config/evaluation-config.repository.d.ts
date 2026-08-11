type EvaluationConfigFields = {
    code?: string;
    name?: string;
    description?: string | null;
};
export declare function createEvidenceCategory(code: string, name: string, description: string | null): Promise<any>;
export declare function findEvidenceCategoryById(id: string): Promise<any>;
export declare function listEvidenceCategories(limit: number, offset: number, search?: string): Promise<any[]>;
export declare function updateEvidenceCategory(id: string, fields: EvaluationConfigFields): Promise<any>;
export declare function deleteEvidenceCategory(id: string): Promise<any>;
export declare function createEvaluationDimension(code: string, name: string, description: string | null): Promise<any>;
export declare function findEvaluationDimensionById(id: string): Promise<any>;
export declare function listEvaluationDimensions(limit: number, offset: number, search?: string): Promise<any[]>;
export declare function updateEvaluationDimension(id: string, fields: EvaluationConfigFields): Promise<any>;
export declare function deleteEvaluationDimension(id: string): Promise<any>;
export declare function createSuccessSignal(code: string, name: string, description: string | null): Promise<any>;
export declare function findSuccessSignalById(id: string): Promise<any>;
export declare function listSuccessSignals(limit: number, offset: number, search?: string): Promise<any[]>;
export declare function updateSuccessSignal(id: string, fields: EvaluationConfigFields): Promise<any>;
export declare function deleteSuccessSignal(id: string): Promise<any>;
export {};
//# sourceMappingURL=evaluation-config.repository.d.ts.map