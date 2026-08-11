import type { AuthTokens, SessionMeta } from "./auth.types";
export declare function revokeRefreshToken(client: any, revokedReason: string, userId: string): Promise<void>;
export declare function refreshTokenRotation(data: Pick<AuthTokens, "refreshToken">, meta: SessionMeta): Promise<{
    userId: any;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}>;
//# sourceMappingURL=auth.refresh.service.d.ts.map