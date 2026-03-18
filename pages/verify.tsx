import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Status = "loading" | "success" | "error" | "resent";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (!router.isReady) return;

    const token = router.query.token as string;

    if (!token) {
      setStatus("error");
      setError("Missing verification token.");
      return;
    }

    fetch(`/api/users/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Verification failed");
        }
        return data;
      })
      .then(() => {
        setStatus("success");
        setTimeout(() => router.push("/auth"), 2000);
      })
      .catch((err) => {
        setStatus("error");
        setError(err.message);
      });
  }, [router.isReady, router.query.token, router]);

  const resendVerificationEmail = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      const res = await fetch(`/api/users/resend-verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend verification email");
      }

      setError("");
      setStatus("resent");
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email");
      setStatus("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700 text-lg font-medium">Verifying your email...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-red-800 text-white px-8 py-6">
            <h1 className="text-2xl font-semibold text-center">
              <span className="text-2xl">❌</span> Verification Failed
            </h1>
            <p className="text-slate-200 mt-1 text-center">{error}</p>
          </div>

          {error === "Token has expired" && (
            <div className="p-8">
              <div className="text-left">
                <p className="mt-2 text-slate-600">
                  Please enter your email to receive a new verification link. If the email exists in our system, you will receive a new verification email shortly.
                </p>

                <input
                  className="mt-4 w-full border rounded-xl px-4 py-2"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />

                <p className="text-sm italic py-4">
                  If you don't receive the email, check your spam folder or try again later.
                </p>

                <p className="text-sm italic text-red-500">
                  Token expires in 10 mins when verification email is sent.
                </p>

                <button
                  className="mt-4 w-full bg-blue-600 text-white rounded-xl py-2 font-bold hover:cursor-pointer hover:bg-blue-700 transition"
                  onClick={resendVerificationEmail}
                >
                  Resend Verification Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === "resent") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-amber-600 text-white px-8 py-6">
            <h1 className="text-2xl font-semibold text-center">
              <span className="text-2xl">📧</span> Awaiting Email Verification
            </h1>
            <p className="text-amber-100 mt-1 text-center">
              A new verification email has been sent.
            </p>
          </div>

          <div className="p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-2xl">📨</span>
              </div>

              <h2 className="text-xl font-semibold mt-4">Check your inbox</h2>

              <p className="mt-2 text-slate-600">
                We’ve sent a new verification link to <span className="font-medium">{email}</span>.
              </p>

              <p className="mt-3 text-sm text-slate-500">
                Please open the email and click the verification link to continue.
              </p>

              <p className="mt-3 text-sm italic text-slate-500">
                If you don’t see it, check your spam folder or try again later.
              </p>

              <button
                className="mt-6 w-full bg-slate-900 text-white rounded-xl py-2 font-bold hover:cursor-pointer hover:bg-slate-800 transition"
                onClick={() => router.push("/auth")}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-8 py-6">
          <h1 className="text-2xl font-semibold">Email Verification</h1>
          <p className="text-slate-200 mt-1">Your email is now verified.</p>
        </div>

        <div className="p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-xl font-semibold mt-4">Verified!</h2>
            <p className="mt-2 text-slate-600">Redirecting to login...</p>
          </div>
        </div>
      </div>
    </div>
  );
}