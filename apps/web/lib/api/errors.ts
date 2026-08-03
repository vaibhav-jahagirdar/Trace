export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(data?: unknown) {
    super("Validation failed", 422, data);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(data?: unknown) {
    super("Unauthorized", 401, data);
  }
}

export class ForbiddenError extends ApiError {
  constructor(data?: unknown) {
    super("Forbidden", 403, data);
  }
}

export class NotFoundError extends ApiError {
  constructor(data?: unknown) {
    super("Resource not found", 404, data);
  }
}

export class ConflictError extends ApiError {
  constructor(data?: unknown) {
    super("Conflict", 409, data);
  }
}

export class ServerError extends ApiError {
  constructor(status: number, data?: unknown) {
    super("Internal server error", status, data);
  }
}

export function mapApiError(
  status: number,
  data?: unknown
): ApiError {
  switch (status) {
    case 401:
      return new UnauthorizedError(data);

    case 403:
      return new ForbiddenError(data);

    case 404:
      return new NotFoundError(data);

    case 409:
      return new ConflictError(data);

    case 422:
      return new ValidationError(data);

    default:
      return new ServerError(status, data);
  }
}