import { PoolClient } from "pg";
export interface JobDraftRow {
    id: string;
    user_id: string;
    org_id: string;
    form_data: Record<string, unknown>;
    current_step: number;
    status: "DRAFT" | "COMPLETED";
    job_id: string | null;
    created_at: string;
    updated_at: string;
}
export declare function getActiveDraft(userId: string, orgId: string): Promise<JobDraftRow | null>;
export declare function upsertDraft(userId: string, orgId: string, formData: Record<string, unknown>, currentStep: number): Promise<JobDraftRow>;
export declare function getDraftById(draftId: string, userId: string, orgId: string, client: PoolClient): Promise<JobDraftRow>;
export declare function markDraftCompleted(draftId: string, jobId: string, client: PoolClient): Promise<void>;
//# sourceMappingURL=jobDraft.d.ts.map