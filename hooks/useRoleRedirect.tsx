import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth, roleRedirectMap } from "../context/AuthContext";

export const useRoleRedirect = (allowedRoles: string | string[]) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // wait until auth state is loaded
    if (!user) {
      router.replace("/auth"); // not logged in
      return;
    }

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesArray.includes(user.role)) {
      // redirect to their own dashboard
      const redirectPath = roleRedirectMap[user.role] || "/customer";
      router.replace(redirectPath);
    }
  }, [user, loading, router, allowedRoles]);
};
