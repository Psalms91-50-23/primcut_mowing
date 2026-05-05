// utils/utils.js
import { RegisterPayload, LoginPayload, Service, Image, Quote } from "@/types";

export const GST_RATE = 0.15;
export const round2 = (num: number) => Number(num.toFixed(2));

export async function registerUser(payload: RegisterPayload) {
  try {
    const res = await fetch("/api/users/register", {
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
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Register user failed:", err.message);
      throw err;
    }

    console.error("Register user failed:", err);
    throw new Error("Unknown error");
  }
}

export const obfuscateName = (name: string) => {
  if (!name) return "";
  return name.length <= 2 ? name[0] + "*" : name.slice(0, 2) + "*".repeat(name.length - 2);
}

export function obfuscateEmail(email?: string): string {
  if (!email || !email.includes("@")) return "";

  const [local, domain] = email.split("@");

  if (local.length <= 2) {
    return `${local[0] || "*"}***@${domain}`;
  }

  const visibleStart = local.slice(0, 2);
  const visibleEnd = local.length > 4 ? local.slice(-1) : "";
  const hiddenLength = local.length - visibleStart.length - visibleEnd.length;

  return `${visibleStart}${"*".repeat(Math.max(hiddenLength, 3))}${visibleEnd}@${domain}`;
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

export const getRecaptchaV3Token = async (action: string) => {
  if (typeof window === "undefined" || !window.grecaptcha) {
    throw new Error("reCAPTCHA not loaded");
  }

  await new Promise<void>((resolve) => window.grecaptcha.ready(resolve));

  const token = await window.grecaptcha.execute(
    process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY!,
    { action }
  );

  if (!token) {
    throw new Error("Failed to generate reCAPTCHA token");
  }

  return token;
};

export const sendPasswordResetEmail = async ({
  email,
  recaptchaToken,
  recaptchaVersion,
}: {
  email: string;
  recaptchaToken: string;
  recaptchaVersion: string;
}) => {
  const res = await fetch("/api/password-reset/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, recaptchaToken, recaptchaVersion }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Reset failed");

  return data;
};

export function sanitizeDecimalInput(value: string): string {
  // Remove all characters before the first digit
  const match = value.match(/\d.*$/);
  if (!match) return "0.00";

  let sanitized = match[0];

  // Remove all non-digit and non-dot characters
  sanitized = sanitized.replace(/[^0-9.]/g, "");

  // Keep only the first dot
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    sanitized = parts[0] + "." + parts.slice(1).join("");
  }

  // Remove leading zeros before decimal
  const [intPart, decPart] = sanitized.split(".");
  sanitized =
    intPart.replace(/^0+/, "") || "0" + (decPart !== undefined ? "." + decPart : "");

  // If starts with dot, prepend 0
  if (sanitized.startsWith(".")) {
    sanitized = "0" + sanitized;
  }

  // Format to 2 decimals
  const num = parseFloat(sanitized);
  if (isNaN(num)) return "0.00";
  return num.toFixed(2);
}

export function sanitizeIntegerInput(input: string): number {
  const sanitized = input.replace(/\D/g, ""); // remove non-digits
  return sanitized ? parseInt(sanitized, 10) : 1;
}

export function getDashboardRole(role?: string) {
  if (role === "customer") return "customer";
  return "employee";
}

export const pad = (n: number) => String(n).padStart(2, "0");

export const toDatetimeLocalValue = (isoOrNull?: string | null) => {
  if (!isoOrNull) return "";
  const d = new Date(isoOrNull);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export const toDateLocalValue = (value?: string | null) => {
  if (!value) return "";

  const stringValue = String(value).trim();

  // Handles plain YYYY-MM-DD safely
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  // Handles ISO/timestamp fallback
  const d = new Date(stringValue);
  if (Number.isNaN(d.getTime())) return "";

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const localDatetimeToISO = (localValue: string) => {
  if (!localValue) return "";
  return new Date(localValue).toISOString();
};

export const localDateToDB = (localDate: string) => {
  return localDate || null;
}

export const formatDateOnly = (localDate?: string | null) => {
  if (!localDate) return "—";

  const [year, month, day] = localDate.split("-").map(Number);
  if (!year || !month || !day) return "—";

  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-NZ");
}

export const getWindowLabel = (windowPreset?: string | null, windowMins?: number | null) => {
  if (windowPreset === "anytime") return "9:00 am–5:00 pm";
  if (windowPreset === "morning") return "9:00 am–12:00 pm";
  if (windowPreset === "midday") return "12:00 pm–3:00 pm";
  if (windowPreset === "afternoon") return "3:00 pm–5:00 pm";
  if (windowMins && windowMins > 0) return `${windowMins} mins window`;
  return "—";
}

export const formatMoney = (value: number | string | null | undefined) =>
  Number(value || 0).toLocaleString("en-NZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });