import { env } from "@/lib/env/client";

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

type QueueItem = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

class ApiClient {
  private readonly baseUrl = env.NEXT_PUBLIC_API_URL;

  private isRefreshing = false;
  private queue: QueueItem[] = [];

  private onRefreshFailure?: () => void;

  setRefreshFailureHandler(handler: () => void) {
    this.onRefreshFailure = handler;
  }

  private async refreshAccessToken(): Promise<void> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.queue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      await this.executeRefresh();

      this.processQueue();
    } catch (error) {
      this.processQueue(error);
      this.onRefreshFailure?.();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  private async executeRefresh(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      const body = contentType?.includes("application/json")
        ? await res.json()
        : await res.text();
      const message =
        typeof body === "object" && body !== null && "message" in body
          ? String(body.message)
          : "Session expired";
      throw new ApiError(message, res.status, body);
    }
  }

  private processQueue(error?: unknown) {
    this.queue.forEach((p) => {
      if (error) p.reject(error);
      else p.resolve();
    });
    this.queue = [];
  }

  private async request<T>(
    path: string,
    options: RequestOptions = {},
    retry = true,
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers ?? {}),
        },
        body:
          options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });

      if (response.status === 401 && retry && !path.includes("/auth/refresh")) {
        try {
          await this.refreshAccessToken();

          return this.request<T>(path, options, false);
        } catch (refreshError) {
          throw refreshError;
        }
      }


      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : response.statusText || "Request failed";

        throw new ApiError(message, response.status, data);
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : "Network error",
        0,
        null,
      );
    }
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }
  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: "POST", body });
  }
  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: "PUT", body });
  }
  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: "PATCH", body });
  }
  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const api = new ApiClient();
