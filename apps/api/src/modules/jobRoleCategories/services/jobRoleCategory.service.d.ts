import type { CreateJobRoleCategoryInput, UpdateJobRoleCategoryInput } from "../validators/jobRoleCategory.validator";
export declare function listJobRoleCategories(): Promise<any[]>;
export declare function getJobRoleCategory(roleCategoryId: string): Promise<any>;
export declare function createJobRoleCategory(data: CreateJobRoleCategoryInput): Promise<any>;
export declare function updateJobRoleCategory(roleCategoryId: string, data: UpdateJobRoleCategoryInput): Promise<any>;
export declare function deleteJobRoleCategory(roleCategoryId: string): Promise<{
    id: any;
}>;
//# sourceMappingURL=jobRoleCategory.service.d.ts.map