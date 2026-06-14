import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public isOperational: boolean = true
  ) {
    super(message);

    this.name = this.constructor.name;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(
      `${resource} not found`,
      404,
      "NOT_FOUND"
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(
      message,
      401,
      "UNAUTHORIZED"
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(
      message,
      400,
      "VALIDATION_ERROR"
    );
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const requestId =
    req.headers["x-request-id"] ?? null;

  if (
    err instanceof AppError &&
    err.isOperational
  ) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        requestId,
      },
    });
  }

  console.error({
    error: err,
    requestId,
    method: req.method,
    path: req.originalUrl,
  });

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
      requestId,
    },
  });
}