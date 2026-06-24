import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useRouter } from "next/router";

export interface SupabaseUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  user_metadata: any;
}

export interface UserType {
  uuid?: string;
  email: string;
  customer_uuid?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  supabaseUser?: SupabaseUser;
  [key: string]: any;
}

type AuthContextType = {
  user: UserType | null;
  role: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  fetchUser: () => Promise<UserType | null>;
  login: (
    email: string,
    password: string,
    recaptchaToken: string
  ) => Promise<UserType | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const roleRedirectMap: Record<string, string> = {
  owner: "/dashboard/owner",
  admin: "/dashboard/admin",
  employee: "/dashboard/employee",
  customer: "/dashboard/customer",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

  const isMountedRef = useRef(true);
  const fetchInFlightRef = useRef<Promise<UserType | null> | null>(null);
  const hasInitialFetchRunRef = useRef(false);

  const clearAuthState = useCallback(() => {
    if (!isMountedRef.current) return;
    setUser(null);
    setRole(null);
  }, []);

  const fetchUser = useCallback(async (): Promise<UserType | null> => {
    if (fetchInFlightRef.current) {
      return fetchInFlightRef.current;
    }

    const run = (async () => {
      if (isMountedRef.current) {
        setLoading(true);
      }

      try {
        const res = await fetch(`/api/users/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          clearAuthState();
          return null;
        }

        let json: any = null;

        try {
          json = await res.json();
        } catch {
          clearAuthState();
          return null;
        }

        if (!json?.user) {
          clearAuthState();
          return null;
        }

        const fetchedUser = json.user as UserType;
        const userRole = fetchedUser?.role ?? null;

        if (!isMountedRef.current) {
          return fetchedUser;
        }

        setUser(fetchedUser);
        setRole(userRole);

        return fetchedUser;
      } catch (err) {
        console.error("fetchUser failed", err);
        clearAuthState();
        return null;
      } finally {
        fetchInFlightRef.current = null;

        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    })();

    fetchInFlightRef.current = run;
    return run;
  }, [clearAuthState]);

  const login = useCallback(
    async (
      email: string,
      password: string,
      recaptchaToken: string
    ): Promise<UserType | null> => {
      if (isMountedRef.current) {
        setLoading(true);
      }

      try {
        const res = await fetch("/api/users/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, recaptchaToken }),
        });

        let data: any = null;

        try {
          data = await res.json();
        } catch {
          // backend returned no JSON
        }

        if (!res.ok) {
          throw new Error(data?.error || data?.message || "Login failed");
        }

        const fetchedUser = await fetchUser();

        if (!fetchedUser) {
          throw new Error("Login succeeded but user could not be fetched");
        }

        return fetchedUser;
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [fetchUser]
  );

  const logout = useCallback(async () => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }

      await fetch(`/api/users/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("logout failed", err);
    } finally {
      clearAuthState();

      if (isMountedRef.current) {
        setLoading(false);
      }

      if (router.asPath !== "/auth") {
        router.replace("/auth");
      }
    }
  }, [clearAuthState, router]);

  const hasRole = useCallback(
    (roles: string | string[]): boolean => {
      if (!user || !role) return false;
      if (typeof roles === "string") return role === roles;
      return roles.includes(role);
    },
    [user, role]
  );

  useEffect(() => {
    isMountedRef.current = true;

    if (!hasInitialFetchRunRef.current) {
      hasInitialFetchRunRef.current = true;
      fetchUser();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchUser]);

  // useEffect(() => {
  //   if (!router.isReady) return;
  //   if (loading) return;
  //   if (!role) return;

  //   const target = roleRedirectMap[role];
  //   if (!target) return;

  //   const isHomeRoute = router.pathname === "/";
  //   const alreadyAtTarget =
  //     router.pathname === target || router.asPath === target;

  //   if (isHomeRoute && !alreadyAtTarget) {
  //     router.replace(target);
  //   }
  // }, [router.isReady, router.pathname, router.asPath, loading, role, router]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      role,
      loading,
      logout,
      hasRole,
      fetchUser,
      login,
    }),
    [user, role, loading, logout, hasRole, fetchUser, login]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};