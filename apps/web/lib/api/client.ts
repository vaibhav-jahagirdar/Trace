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

class ApiClient {
  private readonly baseUrl = env.NEXT_PUBLIC_API_URL;

  private async request<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      body:
        options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    });

    const contentType = response.headers.get("content-type");

    const data =
      contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
      throw new ApiError(
        response.statusText || "Request failed",
        response.status,
        data
      );
    }

    return data as T;
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body,
    });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "PUT",
      body,
    });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "PATCH",
      body,
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();