import { AcceptInviteInput } from "../invites.validator";
import { SessionMeta } from "../../auth/auth.types";
export declare function acceptInvite(data: AcceptInviteInput, meta: SessionMeta): Promise<{
    userId: string;
    email: any;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}>;
//# sourceMappingURL=invites.accept.service.d.ts.map