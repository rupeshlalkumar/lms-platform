import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { authenticatedRequest } from "./lib/api";
import { useAuth } from "./useAuth";

type Course = {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  thumbnail: string;
  price: number;
  currency: string;
  level: string;
};

type CourseResponse = {
  success: boolean;
  course?: Course;
  message?: string;
};

type EnrollmentResponse = {
  success: boolean;
  message?: string;
  enrollment?: {
    id?: string;
    status?: string;
  };
};

const API_URL = "http://localhost:5000/api/courses";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CourseDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, accessToken, user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = useState("");
  const [enrollmentError, setEnrollmentError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourse() {
      try {
        setLoading(true);
        setError("");
        setCourse(null);
        setEnrollmentMessage("");
        setEnrollmentError("");

        if (!slug) {
          setError("Valid course URL nahi hai.");
          return;
        }

        const response = await fetch(`${API_URL}/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });

        const data: CourseResponse = await response.json();

        if (response.status === 404) {
          setError("Course nahi mila.");
          return;
        }

        if (!response.ok || !data.success || !data.course) {
          throw new Error(data.message || "Course details load nahi ho paayi.");
        }

        setCourse(data.course);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Kuch galat ho gaya. Please dobara try karein.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadCourse();

    return () => controller.abort();
  }, [slug]);

  async function handleEnrollment() {
    setEnrollmentMessage("");
    setEnrollmentError("");

    if (!isAuthenticated || !accessToken) {
      navigate("/login", {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
          message: "Course mein enroll karne ke liye pehle login karein.",
        },
      });
      return;
    }

    if (user?.role !== "student") {
      setEnrollmentError(
        "Course enrollment sirf student account se kiya ja sakta hai.",
      );
      return;
    }

    if (!course?.slug) {
      setEnrollmentError("Course details available nahi hain.");
      return;
    }

    setEnrolling(true);

    try {
      const result = await authenticatedRequest<EnrollmentResponse>(
        "/enrollments",
        accessToken,
        {
          method: "POST",
          body: JSON.stringify({ courseSlug: course.slug }),
        },
      );

      setEnrollmentMessage(
        result.message ||
          "Enrollment successful! Ab aap My Courses dekh sakte hain.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Enrollment nahi ho paaya. Please dobara try karein.";

      if (/payment|required|402/i.test(message)) {
        setEnrollmentError(
          "Is paid course ke liye payment zaroori hai. Payment gateway abhi available nahi hai.",
        );
      } else if (/already enrolled|duplicate|409/i.test(message)) {
        setEnrollmentError(
          "Aap pehle se is course mein enrolled hain. My Courses se ise access karein.",
        );
      } else if (/401|unauthorized|token/i.test(message)) {
        setEnrollmentError(
          "Aapka login session expire ho gaya hai. Dobara login karein.",
        );
      } else {
        setEnrollmentError(message);
      }
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-[55vh] max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p role="status" className="text-slate-600">
          Course details load ho rahi hain...
        </p>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="mx-auto min-h-[55vh] max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-950">
          {error || "Course nahi mila."}
        </h1>
        <p className="mt-3 text-slate-600">
          Course ka link check karein ya available courses dekhein.
        </p>
        <Link
          to="/courses"
          className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
        >
          Browse Courses
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[55vh] w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Link
        to="/courses"
        className="text-sm font-semibold text-blue-700 hover:text-blue-900"
      >
        ← Back to Courses
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-800">
              {course.category}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold capitalize text-slate-700">
              {course.level.replace("-", " ")}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            {course.title}
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            {course.shortDescription}
          </p>

          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="mt-8 max-h-96 w-full rounded-2xl object-cover"
            />
          )}

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              About This Course
            </h2>
            <p className="mt-4 whitespace-pre-line leading-8 text-slate-700">
              {course.description}
            </p>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Course Price</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-950">
            {formatPrice(course.price, course.currency)}
          </p>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-sm text-slate-600">Category</p>
            <p className="mt-1 font-semibold text-slate-900">
              {course.category}
            </p>

            <p className="mt-4 text-sm text-slate-600">Course Level</p>
            <p className="mt-1 font-semibold capitalize text-slate-900">
              {course.level.replace("-", " ")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleEnrollment()}
            disabled={enrolling}
            className="mt-7 w-full rounded-lg bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enrolling
              ? "Processing..."
              : isAuthenticated
                ? "Enroll Now"
                : "Login to Enroll"}
          </button>

          {enrollmentMessage && (
            <div
              role="status"
              className="mt-4 rounded-lg bg-green-50 p-4 text-sm leading-6 text-green-800"
            >
              <p>{enrollmentMessage}</p>
              <Link
                to="/student/dashboard"
                className="mt-2 inline-block font-bold underline"
              >
                Go to My Courses
              </Link>
            </div>
          )}

          {enrollmentError && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
            >
              <p>{enrollmentError}</p>
              {/session expire|dobara login/i.test(enrollmentError) && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/login", {
                      state: {
                        from: {
                          pathname: location.pathname,
                          search: location.search,
                          hash: location.hash,
                        },
                      },
                    })
                  }
                  className="mt-2 font-bold underline"
                >
                  Login again
                </button>
              )}
              {/pehle se|already enrolled/i.test(enrollmentError) && (
                <Link
                  to="/student/dashboard"
                  className="mt-2 inline-block font-bold underline"
                >
                  Open My Courses
                </Link>
              )}
            </div>
          )}

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {course.price > 0
              ? "Paid course: enrollment payment verification ke baad hi activate hoga."
              : isAuthenticated
                ? "Yeh course free hai. Enroll Now par click karke enrollment complete karein."
                : "Enroll karne ke liye apne student account se login karein."}
          </p>
        </aside>
      </div>
    </main>
  );
}
