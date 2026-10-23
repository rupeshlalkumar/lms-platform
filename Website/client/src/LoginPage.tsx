import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

type LoginPageProps = {
  registrationSuccess?: string;
};

type LoginRouteState = {
  registrationSuccess?: string;
  loginSuccess?: string;
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
};

export default function LoginPage({ registrationSuccess }: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const routeState = location.state as LoginRouteState | null;

  const successMessage = registrationSuccess ?? routeState?.registrationSuccess;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError("Email aur password dono bharein.");
      return;
    }

    if (password.length > 72) {
      setError("Password 72 characters se zyada nahi ho sakta.");
      return;
    }

    setLoading(true);

    try {
      // AuthContext user aur access token ko memory mein set karega.
      await login(normalizedEmail, password);

      // Login ke baad requested page par wapas jaayein.
      const destination = routeState?.from;

      const redirectTo =
        destination?.pathname &&
        destination.pathname.startsWith("/") &&
        !destination.pathname.startsWith("//")
          ? `${destination.pathname}${destination.search ?? ""}${destination.hash ?? ""}`
          : "/";

      navigate(redirectTo, {
        replace: true,
        state: {
          loginSuccess: "Login successful.",
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login nahi ho paaya. Dobara try karein.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-12">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
          MRL Vidya World
        </p>

        <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Apne student account mein sign in karein.
        </p>

        {successMessage && (
          <p
            role="status"
            className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800"
          >
            {successMessage}. Ab apne account mein sign in karein.
          </p>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email address
            </label>

            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>

            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Forgot your password?{" "}
          <Link
            to="/forgot-password"
            className="font-semibold text-blue-700 hover:underline"
          >
            Reset it
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-slate-600">
          Account nahi hai?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-700 hover:underline"
          >
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}
