import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "../services/authApi.js";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    status: "loading",
    user: null,
    error: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      const result = await authApi.me();
      setAuth({ status: "authenticated", user: result.user, error: null });
    } catch (error) {
      if (error.status === 401) {
        setAuth({ status: "unauthenticated", user: null, error: null });
      } else {
        setAuth({ status: "error", user: null, error });
      }
    }
  }, []);

  const retryAuth = useCallback(() => {
    setAuth({ status: "loading", user: null, error: null });
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    let active = true;

    const handleUnauthorized = () => {
      setAuth({ status: "unauthenticated", user: null, error: null });
    };

    async function initializeAuth() {
      try {
        const result = await authApi.me();
        if (active) {
          setAuth({ status: "authenticated", user: result.user, error: null });
        }
      } catch (error) {
        if (!active) {
          return;
        }

        if (error.status === 401) {
          setAuth({ status: "unauthenticated", user: null, error: null });
        } else {
          setAuth({ status: "error", user: null, error });
        }
      }
    }

    window.addEventListener("sharpner:unauthorized", handleUnauthorized);
    initializeAuth();

    return () => {
      active = false;
      window.removeEventListener("sharpner:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const result = await authApi.login(username, password);
    setAuth({ status: "authenticated", user: result.user, error: null });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      if (error.status !== 401) {
        throw error;
      }
    }

    setAuth({ status: "unauthenticated", user: null, error: null });
  }, []);

  const value = useMemo(
    () => ({ ...auth, login, logout, retryAuth }),
    [auth, login, logout, retryAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
