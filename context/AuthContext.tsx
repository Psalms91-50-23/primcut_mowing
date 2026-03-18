import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
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

  const fetchUser = async (): Promise<UserType | null> => {
    setLoading(true);

    try {
      const res = await fetch(`/api/users/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        setRole(null);
        return null;
      }

      const json = await res.json();

      if (!json?.user) {
        setUser(null);
        setRole(null);
        return null;
      }

      const fetchedUser = json.user as UserType;
      const userRole = fetchedUser?.role ?? null;

      setUser(fetchedUser);
      setRole(userRole);

      if (router.pathname === "/" && userRole && roleRedirectMap[userRole]) {
        router.replace(roleRedirectMap[userRole]);
      }

      return fetchedUser;
    } catch (err) {
      console.error("fetchUser failed", err);
      setUser(null);
      setRole(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    recaptchaToken: string
  ): Promise<UserType | null> => {
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
  };

  const logout = async () => {
    try {
      await fetch(`/api/users/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      router.replace("/auth");
    } catch (err) {
      console.error("logout failed", err);
    } finally {
      setUser(null);
      setRole(null);
      setLoading(false);
    }
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user || !role) return false;
    if (typeof roles === "string") return role === roles;
    return roles.includes(role);
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/users/auth/check`, {
          credentials: "include",
        });

        const data = await res.json();

        if (data?.loggedIn) {
          await fetchUser();
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.log("Not logged in", err);
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        logout,
        hasRole,
        fetchUser,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
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