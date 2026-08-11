import { AuthTokens } from "./auth.types";
export declare function logout(data: Pick<AuthTokens, "refreshToken">, userId: string): Promise<void>;
export declare function logoutAll(userId: string): Promise<{
    revokedCount: any;
}>;
//# sourceMappingURL=auth.logout.service.d.ts.map