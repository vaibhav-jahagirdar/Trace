import type { z } from "zod";
import { updateTechnologySchema } from "./technology.schema";
type UpdateTechnologyInput = z.infer<typeof updateTechnologySchema>;
export declare function createTechnology(name: string, category: string | null): Promise<any>;
export declare function getTechnology(id: string): Promise<any>;
export declare function listTechnologies(limit: number, offset: number, search?: string, category?: string): Promise<any[]>;
export declare function updateTechnology(id: string, fields: UpdateTechnologyInput): Promise<any>;
export declare function deleteTechnology(id: string): Promise<any>;
export {};
//# sourceMappingURL=technology.service.d.ts.map