
import { RegisterPayload, LoginPayload, Service, Image, Quote } from "@/types";

export async function loginUser(payload: LoginPayload) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", 
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }

  return res.json();
}