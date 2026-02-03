// utils/utils.js
import { RegisterPayload, LoginPayload, Service, Image, Quote } from "@/types";

export const GST_RATE = 0.15;

export async function registerUser(payload: RegisterPayload) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to register user");
    }

    return data;
  } catch (err: any) {
    if (err instanceof Error) {
      console.error("Register user failed:", err.message);
      throw err;
    }

    console.error("Register user failed:", err);
    throw new Error("Unknown error");
  }
}

export const formatPrettyDate = (date: string) =>
  new Date(date).toLocaleString("en-NZ", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const formatFullName = (
  firstName?: string,
  lastName?: string,
  singleName = false
) => {
  const capitalize = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  if (singleName) {
    return capitalize(firstName || lastName);
  }

  return `${capitalize(firstName)} ${capitalize(lastName)}`.trim();
};

export async function loginUser(payload: LoginPayload) {
  const res = await fetch(`/api/users/auth/login`, 
  // const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/auth/login`, 
    {
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

export const formatExpiry = (expiry: string | Date) => {
  const d = new Date(expiry);

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const yyyy = d.getFullYear();

  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  // const ss = String(d.getSeconds()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

export const calculateSubtotal = (services: Service[]) =>
  services.reduce((sum, s) => sum + s.unit_price * s.quantity, 0);

export const calculateGST = (subtotal: number) =>
  Number((subtotal * GST_RATE).toFixed(2));

export const calculateTotal = (subtotal: number, gst: number) =>
  Number((subtotal + gst).toFixed(2));

export const sendPasswordResetEmail = async ({ email, recaptchaToken, recaptchaVersion } : { email: string, recaptchaToken: string , recaptchaVersion: string }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/password-reset/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, recaptchaToken, recaptchaVersion }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Reset failed");
  console.log({data}, "reset password route frontend")

  return data;
};
