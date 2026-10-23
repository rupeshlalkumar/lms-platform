import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authenticatedRequest } from "./lib/api";
import { useAuth } from "./useAuth";

type EnrolledCourse = {
  id: string;
  course: {
    id: string;
    title: string;
    slug: string;
  };
  status: string;
  enrolledAt: string;
};

type MyEnrollmentsResponse = {
  success: boolean;
  count: number;
  enrollments: EnrolledCourse[];
};

function formatEnrollmentDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StudentDashboard() {
  const { user, accessToken } = useAuth();

  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial API request. State updates occur only after the request settles.
  useEffect(() => {
    let cancelled = false;

    async function fetchMyCourses() {
      if (!accessToken) {
        if (!cancelled) {
          setEnrollments([]);
          setError("Session nahi mili. Please dobara login karein.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const response =
          await authenticatedRequest<MyEnrollmentsResponse>(
            "/enrollments",
            accessToken,
          );

        if (!cancelled) {
          setEnrollments(response.enrollments ?? []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "My Courses load nahi ho paaye. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchMyCourses();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  // Refresh button handler.
  const refreshMyCourses = useCallback(async () => {
    if (!accessToken) {
      setEnrollments([]);
      setError("Session nahi mili. Please dobara login karein.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response =
        await authenticatedRequest<MyEnrollmentsResponse>(
          "/enrollments",
          accessToken,
        );

      setEnrollments(response.enrollments ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "My Courses load nahi ho paaye. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto min-h-[65vh] w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Welcome section */}
      <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-blue-900 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-blue-100">
          STUDENT DASHBOARD
        </p>

        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
          Welcome, {user.name}!
        </h1>

        <p className="mt-3 max-w-2xl leading-7 text-blue-100">
          Welcome to your learning space. Yahan se aap apne courses aur
          learning journey ko manage kar sakte hain.
        </p>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Profile */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-1">
          <h2 className="text-xl font-bold text-slate-900">
            My Profile
          </h2>

          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-sm text-slate-500">Full name</dt>
              <dd className="mt-1 break-words font-semibold text-slate-900">
                {user.name}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">Email address</dt>
              <dd className="mt-1 break-words font-semibold text-slate-900">
                {user.email}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">Account role</dt>
              <dd className="mt-1 font-semibold capitalize text-slate-900">
                {user.role}
              </dd>
            </div>
          </dl>
        </article>

        {/* My Courses */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                My Courses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isLoading
                  ? "Loading your courses..."
                  : `Total enrolled courses: ${enrollments.length}`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void refreshMyCourses()}
              disabled={isLoading}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div
              className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-slate-600"
              role="status"
            >
              Aapke enrolled courses load ho rahe hain...
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5"
              role="alert"
            >
              <h3 className="font-semibold text-red-800">
                Courses load nahi ho paaye
              </h3>

              <p className="mt-2 break-words text-sm leading-6 text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void refreshMyCourses()}
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && enrollments.length === 0 && (
            <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
              <h3 className="font-bold text-slate-900">
                Abhi koi enrolled course nahi hai
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Apni learning journey shuru karne ke liye available
                courses explore karein.
              </p>

              <Link
                to="/courses"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
              >
                Explore Courses
              </Link>
            </div>
          )}

          {/* Enrolled course list */}
          {!isLoading && !error && enrollments.length > 0 && (
            <div className="mt-6 space-y-4">
              {enrollments.map((enrollment) => (
                <article
                  key={enrollment.id}
                  className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-300"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-bold text-slate-900">
                        {enrollment.course.title}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Enrolled on:{" "}
                        {formatEnrollmentDate(enrollment.enrolledAt)}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Status:{" "}
                        <span className="font-semibold capitalize text-slate-700">
                          {enrollment.status}
                        </span>
                      </p>
                    </div>

                    <Link
                      to={`/courses/${encodeURIComponent(enrollment.course.slug)}`}
                      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-800"
                    >
                      View Course
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
