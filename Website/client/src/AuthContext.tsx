import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  authenticatedRequest,
  loginUser,
  type AuthUser,
} from "./lib/api";
import { AuthContext } from "./lib/auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser(email, password);

    setUser(result.user);
    setAccessToken(result.accessToken);
  }, []);

  const logout = useCallback(async () => {
    const token = accessToken;

    // Clear the local session immediately.
    setUser(null);
    setAccessToken(null);

    if (token) {
      try {
        await authenticatedRequest<{ success: boolean }>(
          "/auth/logout",
          token,
          { method: "POST" },
        );
      } catch {
        // Local session remains cleared if the API request fails.
      }
    }
  }, [accessToken]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      login,
      logout,
    }),
    [user, accessToken, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}