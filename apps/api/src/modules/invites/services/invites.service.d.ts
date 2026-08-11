import type { CreateInviteInput } from "../invites.validator";
type CreateInviteResult = {
    inviteId: string;
    email: string;
    token: string;
    expiresAt: Date;
};
export declare function createInvite(data: CreateInviteInput, userId: string): Promise<CreateInviteResult>;
export declare function sendPlatformInviteEmail(email: string, token: string): Promise<void>;
export {};
//# sourceMappingURL=invites.service.d.ts.map