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

export interface UserType  {
  // id?: string | number;
  uuid?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  supabaseUser?: SupabaseUser;
  [key: string]: any;
};

type AuthContextType = {
  user: UserType | null;
  role: string;
  loading: boolean;
  logout: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  fetchUser: () => Promise<UserType | undefined>; 
  login: (email: string, password: string, recaptchaToken: string) => Promise<UserType | undefined>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const roleRedirectMap: Record<string, string> = {
  owner: "/dashboard/owner",
  admin: "/dashboard/admin",
  employee: "/dashboard/employee",
  customer: "/customer",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [role, setRole] = useState<string>("customer");
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  /**
   * Fetch current user from backend.
   * Backend reads HttpOnly cookies and validates tokens.
   */
  const fetchUser = async () => {
    try {
      const res = await fetch(
        `/api/users/auth/me`,
        {
          method: "GET",
          credentials: "include", 
        }
      );

      if (!res.ok) {
        setUser(null);
        setRole("customer");
        return;
      }

      const json = await res.json();
      if (!json?.user) {
        setUser(null);
        setRole("customer");
        return;
      }
      setUser(json.user);
      const userRole = json.user.role || "customer";
      setRole(userRole);
      
        // Redirect to role-based dashboard if on "/"
      if (router.pathname === "/") {
        const redirectPath = roleRedirectMap[userRole] || "/customer";
        router.replace(redirectPath);
      }

      return json.user
    } catch (err) {
      console.error("fetchUser failed", err);
      setUser(null);
      setRole("customer");
    }
  };

  const login = async (
    email: string,
    password: string,
    recaptchaToken: string
  ) => {
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
      throw new Error(
        data?.error ||
        data?.message ||
        "Login failed"
      );
    }

    // 🔐 Never trust login response user — always fetch
    const user = await fetchUser();
    if (!user) {
      throw new Error("Login succeeded but user could not be fetched");
    }

    setUser(user);
    return user;
  };
  /**
   * Logout user:
   * Backend clears cookies.
   * Frontend clears state.
   */
  const logout = async () => {
    try {
      await fetch(`/api/users/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("logout failed", err);
    } finally {
      setUser(null);
      setRole("customer");
    }
  };

  /**
   * Check if user has a role or one of multiple roles
   */
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    if (typeof roles === "string") return role === roles;
    return roles.includes(role);
  };

  /**
   * On mount, fetch backend auth state
   */

    useEffect(() => {
      const initAuth = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/users/auth/check`, { credentials: "include" });
          const data = await res.json();
          if (data.loggedIn) await fetchUser();
        } catch (err) {
          console.log("Not logged in", err);
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
        login 
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
