
const API_BASE_URL = "http://localhost:5000/api";

type ApiErrorBody = {
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
};

// -------------------- AUTH TYPES --------------------

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

// -------------------- COURSE LESSON TYPES --------------------

export type CourseLesson = {
  id: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  content: string;
  videoUrl?: string;
  isCompleted: boolean;
};

export type CourseLessonsResponse = {
  success: boolean;
  course: {
    id: string;
    title: string;
    slug: string;
  };
  count: number;
  progress: {
    completedLessons: number;
    totalLessons: number;
    percentage: number;
  };
  lessons: CourseLesson[];
};

export type SingleLessonResponse = {
  success: boolean;
  course: {
    id: string;
    title: string;
    slug: string;
  };
  lesson: CourseLesson;
};

export type CompleteLessonResponse = {
  success: boolean;
  message: string;
  progress: {
    completedLessons: number;
    percentage: number;
    enrollmentStatus: "active" | "completed" | "cancelled";
  };
  lesson: {
    id: string;
    title: string;
    slug: string;
    isCompleted: boolean;
  };
};

// -------------------- RESPONSE HANDLER --------------------

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

// -------------------- PUBLIC POST REQUEST --------------------

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

// -------------------- AUTH FUNCTIONS --------------------

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

// -------------------- AUTHENTICATED REQUEST --------------------

export async function authenticatedRequest<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    const headers = new Headers(options.headers);

    headers.set("Authorization", `Bearer ${accessToken}`);

    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Server se connection nahi ho paaya. Backend server check karein.",
    );
  }

  return parseResponse<T>(response);
}

// -------------------- COURSE LEARNING API --------------------

/**
 * Enrolled student ke course ke published lessons fetch karta hai.
 */
export async function getCourseLessons(
  courseSlug: string,
  accessToken: string,
): Promise<CourseLessonsResponse> {
  return authenticatedRequest<CourseLessonsResponse>(
    `/courses/${encodeURIComponent(courseSlug)}/lessons`,
    accessToken,
    {
      method: "GET",
    },
  );
}

/**
 * Ek specific published lesson fetch karta hai.
 */
export async function getCourseLesson(
  courseSlug: string,
  lessonSlug: string,
  accessToken: string,
): Promise<SingleLessonResponse> {
  return authenticatedRequest<SingleLessonResponse>(
    `/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonSlug)}`,
    accessToken,
    {
      method: "GET",
    },
  );
}

/**
 * Lesson ko complete mark karke progress database mein save karta hai.
 */
export async function completeCourseLesson(
  courseSlug: string,
  lessonSlug: string,
  accessToken: string,
): Promise<CompleteLessonResponse> {
  return authenticatedRequest<CompleteLessonResponse>(
    `/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonSlug)}/complete`,
    accessToken,
    {
      method: "PATCH",
    },
  );
}
