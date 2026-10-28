
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  completeCourseLesson,
  getCourseLesson,
  getCourseLessons,
  type CourseLesson,
  type CourseLessonsResponse,
} from "./lib/api";

import { useAuth } from "./useAuth";

type LessonWithVideo = CourseLesson & {
  videoUrl?: string;
};

function getYouTubeEmbedUrl(value?: string): string | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());

    if (url.protocol !== "https:") {
      return null;
    }

    const host = url.hostname.toLowerCase();
    const pathSegments = url.pathname
      .split("/")
      .filter(Boolean);

    let videoId: string | null = null;

    if (
      ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)
    ) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else if (
        ["embed", "shorts"].includes(pathSegments[0]) &&
        pathSegments.length >= 2
      ) {
        videoId = pathSegments[1];
      }
    } else if (
      ["youtu.be", "www.youtu.be"].includes(host)
    ) {
      videoId = pathSegments[0] ?? null;
    } else if (
      host === "www.youtube-nocookie.com" &&
      pathSegments[0] === "embed" &&
      pathSegments.length >= 2
    ) {
      videoId = pathSegments[1];
    }

    if (!videoId || !/^[a-zA-Z0-9_-]{6,}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
  } catch {
    return null;
  }
}

export default function CourseLearningPage() {
  const { slug, lessonSlug } = useParams<{
    slug: string;
    lessonSlug: string;
  }>();

  const { accessToken, user } = useAuth();

  const [courseData, setCourseData] =
    useState<CourseLessonsResponse | null>(null);

  const [selectedLesson, setSelectedLesson] =
    useState<CourseLesson | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadLearningData = useCallback(async () => {
    if (!accessToken || !slug) {
      setError("Session ya course information nahi mili.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotice(null);

    try {
      const data = await getCourseLessons(slug, accessToken);
      setCourseData(data);

      if (data.lessons.length === 0) {
        setSelectedLesson(null);
        return;
      }

      const requestedLesson = lessonSlug
        ? data.lessons.find((lesson) => lesson.slug === lessonSlug)
        : undefined;

      const lessonToOpen = requestedLesson ?? data.lessons[0];

      const lessonResponse = await getCourseLesson(
        slug,
        lessonToOpen.slug,
        accessToken,
      );

      setSelectedLesson(lessonResponse.lesson);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Course lessons load nahi ho paaye.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, slug, lessonSlug]);

  useEffect(() => {
    let cancelled = false;

    async function fetchLearningData() {
      if (!accessToken || !slug) {
        setIsLoading(false);
        setError("Session ya course information nahi mili.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setNotice(null);

      try {
        const data = await getCourseLessons(slug, accessToken);

        if (cancelled) return;

        setCourseData(data);

        const targetLesson =
          (lessonSlug
            ? data.lessons.find((lesson) => lesson.slug === lessonSlug)
            : undefined) ?? data.lessons[0];

        if (!targetLesson) {
          setSelectedLesson(null);
          return;
        }

        const response = await getCourseLesson(
          slug,
          targetLesson.slug,
          accessToken,
        );

        if (!cancelled) {
          setSelectedLesson(response.lesson);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Course lessons load nahi ho paaye.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchLearningData();

    return () => {
      cancelled = true;
    };
  }, [accessToken, slug, lessonSlug]);

  async function handleCompleteLesson() {
    if (!accessToken || !slug || !selectedLesson || isCompleting) {
      return;
    }

    setIsCompleting(true);
    setError(null);
    setNotice(null);

    try {
      const response = await completeCourseLesson(
        slug,
        selectedLesson.slug,
        accessToken,
      );

      setSelectedLesson((current) =>
        current
          ? { ...current, isCompleted: true }
          : current,
      );

      setCourseData((current) => {
        if (!current) return current;

        const lessons = current.lessons.map((lesson) =>
          lesson.slug === selectedLesson.slug
            ? { ...lesson, isCompleted: true }
            : lesson,
        );

        return {
          ...current,
          lessons,
          progress: {
            completedLessons: response.progress.completedLessons,
            totalLessons: current.progress.totalLessons,
            percentage: response.progress.percentage,
          },
        };
      });

      setNotice(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Lesson completion save nahi ho paaya.",
      );
    } finally {
      setIsCompleting(false);
    }
  }

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-slate-600" role="status">
          Course aur lessons load ho rahe hain...
        </p>
      </main>
    );
  }

  if (error && !courseData) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-6"
          role="alert"
        >
          <h1 className="text-xl font-bold text-red-800">
            Course load nahi ho paaya
          </h1>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => void loadLearningData()}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800"
          >
            Try Again
          </button>
        </div>

        <Link
          to="/student/dashboard"
          className="mt-5 inline-block font-semibold text-blue-700 hover:underline"
        >
          Back to Dashboard
        </Link>
      </main>
    );
  }

  if (!courseData) {
    return null;
  }

  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/student/dashboard"
        className="text-sm font-semibold text-blue-700 hover:underline"
      >
        ← Back to My Courses
      </Link>

      <header className="mt-5 rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">
          Course Learning
        </p>

        <h1 className="mt-2 text-3xl font-extrabold">
          {courseData.course.title}
        </h1>

        <p className="mt-3 text-slate-300">
          {courseData.progress.completedLessons} of{" "}
          {courseData.progress.totalLessons} lessons completed
        </p>

        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-slate-700"
          role="progressbar"
          aria-label="Course progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={courseData.progress.percentage}
        >
          <div
            className="h-full rounded-full bg-blue-400 transition-all"
            style={{ width: `${courseData.progress.percentage}%` }}
          />
        </div>

        <p className="mt-2 text-sm text-slate-300">
          {courseData.progress.percentage}% complete
        </p>
      </header>

      {error && (
        <div
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
          role="status"
        >
          {notice}
        </div>
      )}

      {courseData.lessons.length === 0 ? (
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            Lessons abhi available nahi hain
          </h2>
          <p className="mt-2 text-slate-600">
            Is course ke liye published lessons add hone ke baad yahan dikhai
            denge.
          </p>
        </section>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Course Lessons
            </h2>

            <ol className="space-y-2">
              {courseData.lessons.map((lesson) => {
                const isSelected = selectedLesson?.slug === lesson.slug;

                return (
                  <li key={lesson.id}>
                    <Link
                      to={`/courses/${encodeURIComponent(courseData.course.slug)}/learn/${encodeURIComponent(lesson.slug)}`}
                      className={`block rounded-lg border p-3 transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-start gap-3">
                        <span className="font-semibold text-slate-500">
                          {lesson.order}.
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block break-words font-semibold text-slate-900">
                            {lesson.title}
                          </span>

                          <span className="mt-1 block text-xs text-slate-500">
                            {lesson.isCompleted ? "Completed" : "Not completed"}
                          </span>
                        </span>

                        <span aria-hidden="true">
                          {lesson.isCompleted ? "✓" : ""}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </aside>

          <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
            {selectedLesson ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-blue-700">
                      LESSON {selectedLesson.order}
                    </p>

                    <h2 className="mt-2 break-words text-2xl font-extrabold text-slate-900">
                      {selectedLesson.title}
                    </h2>
                  </div>

                  {selectedLesson.isCompleted && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                      Completed
                    </span>
                  )}
                </div>

                {selectedLesson.description && (
                  <p className="mt-4 leading-7 text-slate-600">
                    {selectedLesson.description}
                  </p>
                )}

                {(() => {
                  const videoUrl = (selectedLesson as LessonWithVideo).videoUrl;
                  const embedUrl = getYouTubeEmbedUrl(videoUrl);

                  if (embedUrl) {
                    return (
                      <section className="mt-6" aria-label="Lesson video">
                        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                          <iframe
                            key={embedUrl}
                            src={embedUrl}
                            title={`YouTube video: ${selectedLesson.title}`}
                            className="h-full w-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
                        </div>
                      </section>
                    );
                  }

                  if (videoUrl?.trim()) {
                    return (
                      <p
                        className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800"
                        role="status"
                      >
                        Is lesson ka video URL valid YouTube link nahi hai.
                        Admin se URL check karwayein.
                      </p>
                    );
                  }

                  return null;
                })()}

                <article className="mt-6 whitespace-pre-wrap break-words leading-8 text-slate-800">
                  {selectedLesson.content}
                </article>

                <div className="mt-8 border-t border-slate-200 pt-6">
                  <button
                    type="button"
                    onClick={() => void handleCompleteLesson()}
                    disabled={selectedLesson.isCompleted || isCompleting}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {selectedLesson.isCompleted
                      ? "Lesson Completed"
                      : isCompleting
                        ? "Saving Progress..."
                        : "Mark as Complete"}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-slate-600">Lesson select karein.</p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
