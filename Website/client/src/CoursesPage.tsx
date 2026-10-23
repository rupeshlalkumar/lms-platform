
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Course = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: string;
  thumbnail: string;
  price: number;
  currency: string;
  level: string;
};

type CoursesResponse = {
  success: boolean;
  count: number;
  courses: Course[];
  message?: string;
};

const API_URL = "http://localhost:5000/api/courses";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Courses load nahi ho paaye. Please try again.");
        }

        const data: CoursesResponse = await response.json();

        if (!data.success || !Array.isArray(data.courses)) {
          throw new Error("Server se unexpected response mila.");
        }

        setCourses(data.courses);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Kuch galat ho gaya. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadCourses();

    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(courses.map((course) => course.category))],
    [courses]
  );

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.shortDescription.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || course.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [courses, search, category]);

  return (
    <main className="mx-auto min-h-[55vh] w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-extrabold tracking-[0.18em] text-blue-700">
          EXPLORE YOUR POTENTIAL
        </p>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
          Explore Courses
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Apne goals ke hisaab se course chunein aur aaj hi learning shuru karein.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="course-search"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Search courses
          </label>

          <input
            id="course-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Course ka naam search karein..."
            className="min-h-12 w-full rounded-lg border border-slate-300 px-4 text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="course-category"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Category
          </label>

          <select
            id="course-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All categories" : item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <p role="status" className="py-16 text-center text-slate-600">
          Courses load ho rahe hain...
        </p>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 text-red-800"
        >
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Check karein ki backend server localhost:5000 par chal raha hai.
          </p>
        </div>
      )}

      {!loading && !error && filteredCourses.length === 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            {courses.length === 0
              ? "Abhi courses available nahi hain"
              : "Koi matching course nahi mila"}
          </h2>

          <p className="mt-2 text-slate-600">
            {courses.length === 0
              ? "Naye courses jald hi add kiye jayenge."
              : "Search ya category filter badal kar dekhein."}
          </p>
        </div>
      )}

      {!loading && !error && filteredCourses.length > 0 && (
        <>
          <p className="mt-8 text-sm text-slate-600" aria-live="polite">
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "course" : "courses"} found
          </p>

          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <article
                key={course._id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt=""
                    loading="lazy"
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-40 items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-4xl font-extrabold text-blue-700"
                  >
                    {course.title.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                      {course.category}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {course.level}
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-slate-950">
                    {course.title}
                  </h2>

                  <p className="mt-3 flex-1 leading-7 text-slate-600">
                    {course.shortDescription}
                  </p>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-lg font-extrabold text-slate-950">
                      {formatPrice(course.price, course.currency)}
                    </span>

                    <Link
                      to={`/courses/${encodeURIComponent(course.slug)}`}
                      className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
