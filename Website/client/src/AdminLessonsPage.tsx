
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { authenticatedRequest } from "./lib/api";
import { useAuth } from "./useAuth";

type LessonStatus = "draft" | "published";

type Lesson = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  order: number;
  status: LessonStatus;
};

type LessonResponse = {
  success: boolean;
  message?: string;
  count?: number;
  lessons?: Lesson[];
  lesson?: Lesson;
};

type LessonForm = {
  title: string;
  slug: string;
  description: string;
  content: string;
  order: string;
  status: LessonStatus;
};

const emptyForm: LessonForm = {
  title: "",
  slug: "",
  description: "",
  content: "",
  order: "1",
  status: "draft",
};

function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminLessonsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { accessToken } = useAuth();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [form, setForm] = useState<LessonForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadLessons = useCallback(async () => {
    if (!accessToken || !courseId) {
      setError("Authentication token ya course ID nahi mila.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await authenticatedRequest<LessonResponse>(
        `/admin/courses/${courseId}/lessons`,
        accessToken,
      );

      setLessons(result.lessons ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lessons load nahi ho paaye.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, courseId]);

  useEffect(() => {
    let active = true;

    async function fetchLessons() {
      if (!accessToken || !courseId) {
        if (active) {
          setError("Authentication token ya course ID nahi mila.");
          setLoading(false);
        }
        return;
      }

      try {
        const result = await authenticatedRequest<LessonResponse>(
          `/admin/courses/${courseId}/lessons`,
          accessToken,
        );

        if (active) {
          setLessons(result.lessons ?? []);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Lessons load nahi ho paaye.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchLessons();

    return () => {
      active = false;
    };
  }, [accessToken, courseId]);

  function startEditing(lesson: Lesson) {
    setEditingId(lesson._id);
    setForm({
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description ?? "",
      content: lesson.content,
      order: String(lesson.order),
      status: lesson.status,
    });
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      order: String(lessons.length + 1),
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken || !courseId) {
      setError("Authentication token ya course ID nahi mila.");
      return;
    }

    const order = Number(form.order);

    if (!Number.isInteger(order) || order < 1) {
      setError("Lesson order 1 ya usse bada whole number hona chahiye.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: makeSlug(form.slug || form.title),
      description: form.description.trim(),
      content: form.content.trim(),
      order,
      status: form.status,
    };

    if (
      !payload.title ||
      payload.title.length < 3 ||
      !payload.content ||
      !payload.slug
    ) {
      setError("Title kam se kam 3 characters ka aur content required hai.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const endpoint = editingId
        ? `/admin/courses/${courseId}/lessons/${editingId}`
        : `/admin/courses/${courseId}/lessons`;

      const result = await authenticatedRequest<LessonResponse>(
        endpoint,
        accessToken,
        {
          method: editingId ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );

      setMessage(result.message ?? (editingId ? "Lesson update ho gaya." : "Lesson create ho gaya."));
      resetForm();
      await loadLessons();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lesson save nahi ho paaya.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(lesson: Lesson) {
    if (!accessToken || !courseId) return;

    const nextStatus: LessonStatus =
      lesson.status === "published" ? "draft" : "published";

    setError("");
    setMessage("");

    try {
      const result = await authenticatedRequest<LessonResponse>(
        `/admin/courses/${courseId}/lessons/${lesson._id}/status`,
        accessToken,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      setMessage(result.message ?? `Lesson ${nextStatus} ho gaya.`);
      await loadLessons();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lesson status change nahi hua.",
      );
    }
  }

  async function deleteLesson(lesson: Lesson) {
    if (!accessToken || !courseId) return;

    const confirmed = window.confirm(
      `"${lesson.title}" ko delete karna hai? Ye action undo nahi hoga.`,
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const result = await authenticatedRequest<LessonResponse>(
        `/admin/courses/${courseId}/lessons/${lesson._id}`,
        accessToken,
        { method: "DELETE" },
      );

      setMessage(result.message ?? "Lesson delete ho gaya.");

      if (editingId === lesson._id) resetForm();

      await loadLessons();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lesson delete nahi ho paaya.",
      );
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          to="/admin/courses"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          &larr; Back to Course Management
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Lesson Management
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Is course ke lessons create, edit, publish aur manage karo.
        </p>
        <p className="mt-1 break-all text-xs text-gray-500">
          Course ID: {courseId}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {message}
        </div>
      )}

      <section className="mb-10 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="mb-5 text-xl font-semibold text-gray-900">
          {editingId ? "Edit Lesson" : "Add New Lesson"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="lesson-title"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Lesson Title *
              </label>
              <input
                id="lesson-title"
                required
                minLength={3}
                maxLength={200}
                value={form.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setForm((current) => ({
                    ...current,
                    title,
                    slug: editingId ? current.slug : makeSlug(title),
                  }));
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Introduction to the Course"
              />
            </div>

            <div>
              <label
                htmlFor="lesson-slug"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Lesson Slug *
              </label>
              <input
                id="lesson-slug"
                required
                maxLength={220}
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    slug: makeSlug(event.target.value),
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="introduction-to-the-course"
              />
              <p className="mt-1 text-xs text-gray-500">
                URL mein use hone wala unique identifier.
              </p>
            </div>

            <div>
              <label
                htmlFor="lesson-order"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Lesson Order *
              </label>
              <input
                id="lesson-order"
                type="number"
                required
                min={1}
                step={1}
                value={form.order}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    order: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="lesson-status"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="lesson-status"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as LessonStatus,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="lesson-description"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Short Description
            </label>
            <textarea
              id="lesson-description"
              maxLength={1000}
              rows={2}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Is lesson mein kya cover hoga?"
            />
          </div>

          <div>
            <label
              htmlFor="lesson-content"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Lesson Content *
            </label>
            <textarea
              id="lesson-content"
              required
              maxLength={50000}
              rows={10}
              value={form.content}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Lesson ka text content yahan likho..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum 50,000 characters. Video upload is version mein included nahi hai.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Lesson"
                  : "Create Lesson"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Existing Lessons ({lessons.length})
          </h2>

          <button
            type="button"
            onClick={() => void loadLessons()}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-gray-500">Lessons load ho rahe hain...</p>
        ) : lessons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
            Abhi koi lesson nahi hai. Upar form se pehla lesson create karo.
          </div>
        ) : (
          <div className="space-y-4">
            {[...lessons]
              .sort((a, b) => a.order - b.order)
              .map((lesson) => (
                <article
                  key={lesson._id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                          Lesson {lesson.order}
                        </span>
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            lesson.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {lesson.status}
                        </span>
                      </div>

                      <h3 className="break-words text-lg font-semibold text-gray-900">
                        {lesson.title}
                      </h3>
                      <p className="mt-1 break-all text-xs text-gray-500">
                        Slug: {lesson.slug}
                      </p>

                      {lesson.description && (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                          {lesson.description}
                        </p>
                      )}

                      <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-gray-700">
                        {lesson.content}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 sm:max-w-48 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => startEditing(lesson)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => void changeStatus(lesson)}
                        className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                      >
                        {lesson.status === "published" ? "Unpublish" : "Publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void deleteLesson(lesson)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
