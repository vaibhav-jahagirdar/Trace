import type { Request, Response } from "express";
export declare const IS_PRODUCTION: boolean;
export declare function extractSessionMeta(req: Request): {
    ip_address: string | null;
    user_agent: string | null;
    device_name: string | null;
    platform: string | null;
    browser: string | null;
};
export declare function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void;
export declare const register: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const login: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const me: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=auth.controller.d.ts.map