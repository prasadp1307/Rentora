const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
};

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    credentials: "include",
    cache: "no-store",
  });

  const body = (await res.json()) as ApiResponse<T> & { message?: string };

  if (!res.ok || body.success === false) {
    throw new ApiError(body.message ?? "Request failed", res.status);
  }

  return body.data as T;
}

export function getApiBase() {
  return API_BASE;
}
