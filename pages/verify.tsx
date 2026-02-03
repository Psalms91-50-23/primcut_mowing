import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!router.isReady) return;

    const token = router.query.token as string;

    if (!token) {
      setStatus("error");
      setError("Missing verification token.");
      return;
    }

    fetch(`${backendUrl}/api/users/verify`, {
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
  }, [router.isReady]);

  const resendVerificationEmail = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/users/resend-verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend verification email");
      }

      setError("");
      alert("Verification email resent! Please check your inbox.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (status === "loading") {
    return <div>Verifying...</div>;
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-red-600 text-white px-8 py-6">
            <h1 className="text-2xl font-semibold">Verification Failed</h1>
            <p className="text-slate-200 mt-1">{error}</p>
          </div>

          {error === "Token has expired" && (
            <div className="p-8">
              <div className="text-center">
                <p className="mt-2 text-slate-600">
                  Please enter your email to receive a new verification link.
                </p>

                <input
                  className="mt-4 w-full border rounded-xl px-4 py-2"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />

                <button
                  className="mt-4 w-full bg-blue-600 text-white rounded-xl py-2"
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-8 py-6">
          <h1 className="text-2xl font-semibold">Email Verification</h1>
          <p className="text-slate-200 mt-1">
            Your email is now verified.
          </p>
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
