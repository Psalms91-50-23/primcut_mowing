import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import PasswordStrengthBar from "react-password-strength-bar";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingToken, setLoadingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);

  // Check token validity on load
  useEffect(() => {
    if (!token) return;

    const checkToken = async () => {
      try {
        setLoadingToken(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/password-reset/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (!res.ok || data.error === "Token expired") {
          setTokenValid(false);
          setTokenExpired(true);
        } else {
          console.log({ data }, "checking token for reset");
          setTokenValid(true);
        }
      } catch (err) {
        console.error(err);
        setTokenValid(false);
        setTokenExpired(true);
      } finally {
        setLoadingToken(false);
      }
    };

    checkToken();
  }, [token]);

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password || !confirmPassword) return toast.error("Please fill out both fields");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (!token || typeof token !== "string") return toast.error("Invalid reset link");

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/password-reset/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok) return toast.error(data.error || "Failed to reset password");

      toast.success("Password reset successfully!");
      router.push("/auth");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/password-reset/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) return toast.error(data.error || "Failed to send reset link");

      toast.success("Password reset link sent! Check your email.");
      setEmail("");
      setTokenExpired(false);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loadingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {tokenValid ? (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Reset Your Password</h1>
            <p className="text-gray-600 mb-6">Enter your new password below to reset your account.</p>
            <form onSubmit={handleReset} className="space-y-4">
              {/* New Password */}
              <div className="relative">
                <label className="block text-gray-700 mb-1" htmlFor="password">New Password</label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
                  required
                />
                <span
                  className="absolute right-3 top-9 cursor-pointer select-none text-xl"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
                <PasswordStrengthBar
                  password={password}
                  minLength={6}
                  shortScoreWord="Too Short"
                  scoreWords={["Weak", "Fair", "Good", "Strong", "Very Strong"]}
                  className="mt-2"
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="block text-gray-700 mb-1" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
                  required
                />
                <span
                  className="absolute right-3 top-9 cursor-pointer select-none text-xl"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-md font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Resetting...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Password Reset Expired</h1>
            <p className="text-gray-600 mb-6">
              Your password reset link has expired. Enter your email below to request a new one.
            </p>
            <form onSubmit={handleResend} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-md font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        )}

        <p className="text-sm text-gray-500 mt-4">
          Remembered your password?{" "}
          <a href="/auth" className="text-green-700 font-medium">Log in</a>
        </p>
      </div>
    </div>
  );
}
