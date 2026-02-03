import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/router";

// type UserType = {
//   id: string | number;
//   email: string;
//   role: string;
//   [key: string]: any; // any extra fields from backend
// };

type UserType = {
  id?: string | number;
  uuid?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  supabaseUser?: any;
  [key: string]: any;
};

type AuthContextType = {
  user: UserType | null;
  role: string;
  loading: boolean;
  logout: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  fetchUser: () => Promise<void>; // ✅ add this
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/auth/me`,
        {
          method: "GET",
          credentials: "include", // 🔑 send cookies automatically
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
      // const json = await res.json();
      // const { user } = json;
      // console.log({user}, " fetched user in auth context");
      // if (json?.user) {
      //   setUser(json.user);
      //   setRole(json.user.role || "customer");

      //      // 🌟 Use roleRedirectMap for cleaner redirect
      //   if (router.pathname === "/") {
      //     const redirectPath = roleRedirectMap[user.role] || "/customer";
      //     router.replace(redirectPath); // replace is nicer than push
      //   }
      // } else {
      //   setUser(null);
      //   setRole("customer");
      // }
    } catch (err) {
      console.error("fetchUser failed", err);
      setUser(null);
      setRole("customer");
    }
  };

  /**
   * Logout user:
   * Backend clears cookies.
   * Frontend clears state.
   */
  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/auth/logout`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/auth/check`);
      const data = await res.json();
      console.log({data},"auth context")
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
