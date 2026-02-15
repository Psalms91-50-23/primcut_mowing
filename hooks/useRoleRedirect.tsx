import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth, roleRedirectMap } from "../context/AuthContext";

export const useRoleRedirect = (allowedRoles: string | string[]) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; 
    if (!user) {
      router.replace("/auth"); 
      return;
    }

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesArray.includes(user.role)) {
      // redirect to their own dashboard
      const redirectPath = roleRedirectMap[user.role] || "/";
      router.replace(redirectPath);
    }
  }, [user, loading, router, allowedRoles]);
};
