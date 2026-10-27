import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { authenticatedRequest } from "./lib/api";
import { useAuth } from "./useAuth";

type CourseStatus = "draft" | "published" | "archived";
type CourseLevel = "beginner" | "intermediate" | "advanced" | "all-levels";

type Course = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  thumbnail: string;
  price: number;
  currency: "INR";
  level: CourseLevel;
  status: CourseStatus;
  createdAt?: string;
};

type CourseForm = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  thumbnail: string;
  price: string;
  currency: "INR";
  level: CourseLevel;
  status: CourseStatus;
};

const emptyForm: CourseForm = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "",
  thumbnail: "",
  price: "0",
  currency: "INR",
  level: "all-levels",
  status: "draft",
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

function toForm(course: Course): CourseForm {
  return {
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    description: course.description,
    category: course.category,
    thumbnail: course.thumbnail || "",
    price: String(course.price),
    currency: "INR",
    level: course.level,
    status: course.status,
  };
}

function messageFrom(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

export default function AdminCoursesPage() {
  const { user, accessToken } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const loadCourses = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const result = await authenticatedRequest<{
        success: boolean;
        count: number;
        courses: Course[];
      }>("/admin/courses", accessToken);

      setCourses(result.courses);
      setError("");
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    async function fetchInitialCourses() {
      try {
        const result = await authenticatedRequest<{
          success: boolean;
          count: number;
          courses: Course[];
        }>("/admin/courses", accessToken!);

        if (!cancelled) {
          setCourses(result.courses);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(messageFrom(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchInitialCourses();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setNotice("");
    setError("");
    setShowForm(true);
  }

  function startEdit(course: Course) {
    setEditingId(course._id);
    setForm(toForm(course));
    setNotice("");
    setError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateField<K extends keyof CourseForm>(
    field: K,
    value: CourseForm[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      setError("Please log in again.");
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Price must be zero or greater.");
      return;
    }

    const slug = form.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug) {
      setError("Please enter a valid course slug.");
      return;
    }

    const payload = {
      ...form,
      slug,
      price,
    };

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await authenticatedRequest(
        editingId ? `/admin/courses/${editingId}` : "/admin/courses",
        accessToken,
        {
          method: editingId ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );

      setNotice(
        editingId
          ? "Course updated successfully."
          : "Course created successfully.",
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      setLoading(true);
      await loadCourses();
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(course: Course, status: CourseStatus) {
    if (!accessToken) {
      setError("Please log in again.");
      return;
    }

    setError("");
    setNotice("");

    try {
      await authenticatedRequest(
        `/admin/courses/${course._id}/status`,
        accessToken,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );

      setNotice(`"${course.title}" status changed to ${status}.`);

      setLoading(true);
      await loadCourses();
    } catch (err) {
      setError(messageFrom(err));
    }
  }

  async function deleteCourse(course: Course) {
    if (!accessToken) {
      setError("Please log in again.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${course.title}" permanently? This cannot be undone. Courses with enrollments cannot be deleted.`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const result = await authenticatedRequest<{ message: string }>(
        `/admin/courses/${course._id}`,
        accessToken,
        { method: "DELETE" },
      );

      setNotice(result.message || "Course deleted successfully.");

      setLoading(true);
      await loadCourses();
    } catch (err) {
      setError(messageFrom(err));
    }
  }

  if (user?.role !== "admin") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-900">
          Admin access required
        </h1>
        <p className="mt-3 text-slate-600">
          This page is only available to administrator accounts.
        </p>
        <Link className="mt-5 inline-block text-blue-700 underline" to="/">
          Return home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
            Course Management
          </h1>
          <p className="mt-2 text-slate-600">
            Create, edit, publish, archive and manage your courses.
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
        >
          + Create course
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {notice}
        </div>
      )}

      {showForm && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-950">
              {editingId ? "Edit course" : "Create a course"}
            </h2>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Course title *
                <input
                  required
                  minLength={3}
                  maxLength={150}
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Slug *
                <input
                  required
                  maxLength={180}
                  pattern="[A-Za-z0-9-]+"
                  className={inputClass}
                  placeholder="web-development-basics"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Used in the course URL. Use English letters, numbers and
                  hyphens.
                </span>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Category *
                <input
                  required
                  maxLength={100}
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Price (INR) *
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Set 0 for a free course.
                </span>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Course level *
                <select
                  className={inputClass}
                  value={form.level}
                  onChange={(e) =>
                    updateField("level", e.target.value as CourseLevel)
                  }
                >
                  <option value="all-levels">All levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Initial status
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(e) =>
                    updateField("status", e.target.value as CourseStatus)
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>

            <label className="block text-sm font-semibold text-slate-700">
              Short description *
              <textarea
                required
                maxLength={300}
                rows={2}
                className={inputClass}
                value={form.shortDescription}
                onChange={(e) =>
                  updateField("shortDescription", e.target.value)
                }
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Full description *
              <textarea
                required
                maxLength={20000}
                rows={5}
                className={inputClass}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Thumbnail image URL
              <input
                type="url"
                maxLength={2048}
                className={inputClass}
                placeholder="https://example.com/course-image.jpg"
                value={form.thumbnail}
                onChange={(e) => updateField("thumbnail", e.target.value)}
              />
            </label>

            <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
              <button
                disabled={saving}
                type="submit"
                className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Create course"}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-950">
            All courses{" "}
            <span className="text-slate-500">({courses.length})</span>
          </h2>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              void loadCourses();
            }}
            className="text-sm font-semibold text-blue-700 hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="rounded-xl border border-slate-200 p-8 text-slate-600">
            Loading courses...
          </p>
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
            <p className="font-semibold text-slate-800">No courses found.</p>
            <p className="mt-2 text-sm text-slate-600">
              Create your first course using the button above.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={`${course.title} course thumbnail`}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-slate-100 text-sm font-semibold text-slate-400">
                    No course image
                  </div>
                )}

                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                      {course.status}
                    </span>

                    <span className="text-sm font-bold text-slate-900">
                      {course.price === 0 ? "Free" : `₹${course.price}`}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-950">
                    {course.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {course.category} · {course.level}
                  </p>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {course.shortDescription}
                  </p>

                  <p className="mt-3 break-all text-xs text-slate-400">
                    /courses/{course.slug}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      to={`/admin/courses/${course._id}/lessons`}
                      className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800"
                    >
                      Manage Lessons
                    </Link>

                    <button
                      type="button"
                      onClick={() => startEdit(course)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    {course.status !== "published" && (
                      <button
                        type="button"
                        onClick={() => void changeStatus(course, "published")}
                        className="rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white hover:bg-green-800"
                      >
                        Publish
                      </button>
                    )}

                    {course.status !== "draft" && (
                      <button
                        type="button"
                        onClick={() => void changeStatus(course, "draft")}
                        className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50"
                      >
                        Set draft
                      </button>
                    )}

                    {course.status !== "archived" && (
                      <button
                        type="button"
                        onClick={() => void changeStatus(course, "archived")}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Archive
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => void deleteCourse(course)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
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
