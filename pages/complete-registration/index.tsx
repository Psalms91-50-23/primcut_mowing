import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PasswordStrengthBar from "react-password-strength-bar";
import { toast } from "react-hot-toast";
export default function CompleteRegistration() {
    const router = useRouter();
    const { token } = router.query;

    const [loading, setLoading] = useState(true);
    const [validToken, setValidToken] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [passwordScore, setPasswordScore] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) return;

    const validateToken = async () => {
      try {
        const res = await fetch(
          `/api/pre-users/validate-registration-token?token=${token}`
        );

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.error || "Invalid or expired link.");
        } else {
          setValidToken(true);
        }
      } catch {
        setMessage("Unable to validate link.");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (!confirmPassword) {
      setMessage("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (passwordScore < 2) {
      setMessage("Please choose a stronger password.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch(`/api/pre-users/complete-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to complete registration.");
      } else {
        toast.success("Account created successfully!");
        setTimeout(() => router.push("/auth"), 2000);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        {loading && (
          <h2 className="text-xl font-semibold text-center">
            Validating link...
          </h2>
        )}

        {!loading && !validToken && (
          <>
            <h2 className="text-xl font-semibold text-red-600">
              Invalid or Expired Link
            </h2>
            <p className="mt-2 text-gray-600">{message}</p>
          </>
        )}

        {!loading && validToken && (
          <>
            <h2 className="text-2xl font-bold text-gray-800">
              Set Up Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Create a password to finish setting up your account.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>

                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 pr-20 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 text-sm text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                <PasswordStrengthBar
                  password={password}
                  onChangeScore={(score) => setPasswordScore(score)}
                />

                <p className="mt-1 text-xs text-gray-500">
                  Use at least 8 characters. A mix of uppercase, lowercase,
                  numbers, and symbols is stronger.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>

                <div className="mt-1 relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 pr-20 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="absolute inset-y-0 right-3 text-sm text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    Passwords do not match.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition hover:cursor-pointer"
              >
                {submitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {message && (
              <p className="mt-4 text-sm text-red-600">{message}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}