const API_BASE_URL = "http://localhost:5000/api";

type ApiErrorBody = {
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
};

export type LoginResponse = {
  success: boolean;
  message: string;
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: AuthUser;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  user: AuthUser;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!response.ok) {
    const validationMessage = data.errors
      ?.map((error) => error.message)
      .filter(Boolean)
      .join(" ");

    throw new Error(
      validationMessage || data.message || "Request fail ho gayi.",
    );
  }

  return data;
}

async function request<T>(
  endpoint: string,
  body: Record<string, string>,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Server se connection nahi ho paaya. Backend server check karein.",
    );
  }

  return parseResponse<T>(response);
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", { email, password });
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<RegisterResponse> {
  return request<RegisterResponse>("/auth/register", {
    name,
    email,
    password,
  });
}

export async function authenticatedRequest<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...Object.fromEntries(new Headers(options.headers).entries()),
        Authorization: `Bearer ${accessToken}`,
        ...(options.body &&
        typeof options.body === "string" &&
        !new Headers(options.headers).has("Content-Type")
          ? { "Content-Type": "application/json" }
          : {}),
      },
    });
  } catch {
    throw new Error(
      "Server se connection nahi ho paaya. Backend server check karein.",
    );
  }

  return parseResponse<T>(response);
}