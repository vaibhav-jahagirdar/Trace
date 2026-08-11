"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.ValidationError = exports.UnauthorizedError = exports.BadRequestError = exports.NotFoundError = exports.AppError = void 0;
exports.errorHandler = errorHandler;
const logger_1 = require("../lib/logger");
class AppError extends Error {
    message;
    statusCode;
    code;
    isOperational;
    constructor(message, statusCode = 500, code = "INTERNAL_ERROR", isOperational = true) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(resource = "Resource") {
        super(`${resource} not found`, 404, "NOT_FOUND");
    }
}
exports.NotFoundError = NotFoundError;
class BadRequestError extends AppError {
    constructor(message = "Bad Request") {
        super(message, 400, "BAD_REQUEST");
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401, "UNAUTHORIZED");
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400, "VALIDATION_ERROR");
    }
}
exports.ValidationError = ValidationError;
class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403, "FORBIDDEN");
    }
}
exports.ForbiddenError = ForbiddenError;
function errorHandler(err, req, res, _next) {
    const requestId = req.id ?? req.headers["x-request-id"] ?? null;
    if (err instanceof AppError && err.isOperational) {
        logger_1.logger.warn({
            err,
            code: err.code,
            statusCode: err.statusCode,
            requestId,
            method: req.method,
            path: req.originalUrl,
            userId: req.user?.id,
        }, err.message);
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                requestId,
            },
        });
    }
    logger_1.logger.error({
        err,
        requestId,
        method: req.method,
        path: req.originalUrl,
        userId: req.user?.id,
    }, "unhandled error");
    return res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_ERROR",
            message: "Something went wrong",
            requestId,
        },
    });
}
//# sourceMappingURL=errorHandler.js.map