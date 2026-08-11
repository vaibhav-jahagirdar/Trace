import type { RegisterInput, LoginInput } from "./auth.validator";
import type { SessionMeta, AuthResult } from "./auth.types";
export declare const JWT_SECRET: string | undefined;
export declare function generateAccessToken(userId: string, sessionId: string): string;
export declare function generateRefreshToken(): string;
export declare function hashRefreshToken(token: string): string;
export declare function getRefreshTokenExpiry(): Date;
export declare function handlePgError(err: any): never;
export declare function registerUser(data: RegisterInput, meta: SessionMeta): Promise<AuthResult>;
export declare function loginUser(data: LoginInput, meta: SessionMeta): Promise<{
    userId: any;
    userName: any;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}>;
export declare function getUserWithOrgs(userId: string): Promise<any>;
//# sourceMappingURL=auth.service.d.ts.map