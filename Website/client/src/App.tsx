import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import CoursesPage from "./CoursesPage";
import CourseDetailsPage from "./CourseDetailsPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import StudentDashboard from "./StudentDashboard";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "./useAuth";

const publicPages = [
  { path: "/about", title: "About Us" },
  { path: "/pricing", title: "Pricing" },
  { path: "/faq", title: "Frequently Asked Questions" },
  { path: "/contact", title: "Contact Us" },
  { path: "/privacy", title: "Privacy Policy" },
  { path: "/terms", title: "Terms of Service" },
  { path: "/refund-policy", title: "Refund & Cancellation Policy" },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap text-sm font-semibold transition hover:text-blue-700 ${
    isActive ? "text-blue-700" : "text-slate-600"
  }`;

function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          aria-label="MRL Vidya World home"
          className="text-xl font-extrabold tracking-tight text-blue-800"
        >
          MRL <span className="text-slate-900">Vidya World</span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="order-3 flex w-full gap-5 overflow-x-auto py-2 md:order-none md:w-auto md:flex-wrap"
        >
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>

          <NavLink to="/courses" className={navClass}>
            Courses
          </NavLink>

          <NavLink to="/about" className={navClass}>
            About
          </NavLink>

          <NavLink to="/pricing" className={navClass}>
            Pricing
          </NavLink>

          <NavLink to="/contact" className={navClass}>
            Contact
          </NavLink>
        </nav>

        <div className="flex flex-wrap items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <span className="max-w-40 truncate text-sm font-semibold text-slate-700">
                Hi, {user.name}
              </span>

              <Link
                to="/student/dashboard"
                className="text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={() => void logout()}
                className="text-sm font-semibold text-slate-700 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-blue-700"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-4 py-10 sm:px-6 md:flex-row md:px-8">
        <div>
          <Link to="/" className="text-xl font-extrabold">
            MRL <span className="text-blue-300">Vidya World</span>
          </Link>

          <p className="mt-3 text-sm text-slate-300">
            Learn new skills. Build your future.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-5"
        >
          <Link
            className="text-sm text-slate-300 hover:text-white"
            to="/faq"
          >
            FAQ
          </Link>

          <Link
            className="text-sm text-slate-300 hover:text-white"
            to="/privacy"
          >
            Privacy
          </Link>

          <Link
            className="text-sm text-slate-300 hover:text-white"
            to="/terms"
          >
            Terms
          </Link>

          <Link
            className="text-sm text-slate-300 hover:text-white"
            to="/refund-policy"
          >
            Refund Policy
          </Link>
        </nav>
      </div>

      <div className="border-t border-slate-800 px-4 py-5 text-sm text-slate-400 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          © {new Date().getFullYear()} MRL Vidya World. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <main>
      <section className="bg-gradient-to-br from-blue-50 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <p className="mb-5 text-xs font-extrabold tracking-[0.18em] text-blue-700">
            WELCOME TO MRL VIDYA WORLD
          </p>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Learn Today.
            <span className="block text-blue-700">Lead Tomorrow.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Build practical skills with structured courses designed to help
            you learn confidently and move forward in your career.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/courses"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Explore Courses
            </Link>

            <Link
              to={isAuthenticated ? "/student/dashboard" : "/about"}
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 font-bold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {isAuthenticated ? "Go to Dashboard" : "Discover Our Academy"}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-xs font-extrabold tracking-[0.18em] text-blue-700">
            YOUR LEARNING JOURNEY
          </p>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            A better way to learn
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Clear learning paths, practical knowledge and flexible access.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Structured Courses",
              description:
                "Follow organised lessons that make complex topics easier to understand.",
            },
            {
              number: "02",
              title: "Learn at Your Pace",
              description:
                "Study on your schedule and revisit learning materials when needed.",
            },
            {
              number: "03",
              title: "Practical Skills",
              description:
                "Focus on useful knowledge you can apply beyond the classroom.",
            },
          ].map((feature) => (
            <article
              key={feature.number}
              className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="text-sm font-extrabold text-blue-700">
                {feature.number}
              </span>

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                {feature.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-blue-50">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="mb-2 text-xs font-extrabold tracking-[0.18em] text-blue-700">
              START LEARNING
            </p>

            <h2 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">
              Your next step starts here.
            </h2>
          </div>

          <Link
            to={isAuthenticated ? "/student/dashboard" : "/register"}
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            {isAuthenticated ? "Open Dashboard" : "Create Your Account"}
          </Link>
        </div>
      </section>
    </main>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="mx-auto min-h-[55vh] w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="mb-4 text-xs font-extrabold tracking-[0.18em] text-blue-700">
        MRL VIDYA WORLD
      </p>

      <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
        {title}
      </h1>

      <p className="mt-4 max-w-xl leading-7 text-slate-600">
        This page is being prepared. Please check back soon.
      </p>

      <Link
        to="/"
        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
      >
        Back to Home
      </Link>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="mx-auto min-h-[55vh] w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-slate-950">
        Page not found
      </h1>

      <p className="mt-4 text-slate-600">
        The page you are looking for does not exist.
      </p>

      <Link
        to="/"
        className="mt-7 inline-flex rounded-lg bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
      >
        Go to Home
      </Link>
    </main>
  );
}

function RouteContent() {
  const location = useLocation();

  const routeState = location.state as
    | { registrationSuccess?: string }
    | null;

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {publicPages.map((page) => (
        <Route
          key={page.path}
          path={page.path}
          element={<PlaceholderPage title={page.title} />}
        />
      ))}

      <Route
        path="/login"
        element={
          <LoginPage
            registrationSuccess={routeState?.registrationSuccess}
          />
        }
      />

      <Route path="/register" element={<RegisterPage />} />

      <Route path="/courses" element={<CoursesPage />} />

      <Route path="/courses/:slug" element={<CourseDetailsPage />} />

      {/* Login required for all routes nested inside ProtectedRoute. */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900 antialiased">
          <Header />
          <RouteContent />
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
