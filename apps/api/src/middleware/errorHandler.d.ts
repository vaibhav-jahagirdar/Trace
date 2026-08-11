import { Request, Response, NextFunction } from "express";
export declare class AppError extends Error {
    message: string;
    statusCode: number;
    code: string;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, code?: string, isOperational?: boolean);
}
export declare class NotFoundError extends AppError {
    constructor(resource?: string);
}
export declare class BadRequestError extends AppError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): Response<any, Record<string, any>>;
//# sourceMappingURL=errorHandler.d.ts.map