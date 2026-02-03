import React, { useState, useEffect } from "react";
import PasswordStrengthBar from "react-password-strength-bar";
import { registerUser, loginUser, sendPasswordResetEmail } from "../utils/utils";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";

type Props = {};

export default function AuthPage(props: Props) {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");

  // Password visibility states
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const { fetchUser } = useAuth();
  const router = useRouter();

  // Form fields
  const [email, setEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Loading states
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setMode("login"); // always start on login
  }, []);

  // ----------------------------
  // reCAPTCHA helpers
  // ----------------------------
  const getRecaptchaV3Token = async (action: string) => {
    // Commented out for testing v2 only
    /*
    if (!window.grecaptcha) {
      toast.error("reCAPTCHA not loaded");
      return null;
    }

    await new Promise<void>((resolve) => window.grecaptcha.ready(resolve));
    return await window.grecaptcha.execute(
      process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY!,
      { action }
    );
    */
    return null; // skip v3 for now
  };

  const handleV2Challenge = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) return reject("reCAPTCHA v2 not loaded");

      const container = document.getElementById("recaptcha-v2-container");
      if (!container) return reject("v2 container not found");

      window.grecaptcha.ready(() => {
        const widgetId = window.grecaptcha.render(container, {
          sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY!,
          size: "normal", // ensures visible checkbox
          callback: (token: string) => resolve(token),
          "expired-callback": () => reject("v2 token expired"),
          "error-callback": () => reject("v2 error occurred"),
        });

        // Immediately show the challenge (invisible v2 won't show otherwise)
        // window.grecaptcha.execute(widgetId);
      });
    });
  };


  // const handleV2Challenge = async (): Promise<string> => {
  //   return new Promise((resolve, reject) => {
  //     if (!window.grecaptcha) return reject("reCAPTCHA v2 not loaded");

  //     const container = document.getElementById("recaptcha-v2-container");
  //     if (!container) return reject("v2 container not found");

  //     window.grecaptcha.ready(() => {
  //       window.grecaptcha.render(container, {
  //         sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY!,
  //         callback: (token: string) => resolve(token),
  //       });

  //       // Optional: reject if not solved within 2 minutes
  //       setTimeout(() => reject("v2 challenge timed out"), 120000);
  //     });
  //   });
  // };

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsRegistering(true);

    try {
      // Use v2 for testing
      const token = await handleV2Challenge();

      const payload = {
        firstName,
        lastName,
        email,
        password: registerPassword,
        role: "customer",
        customerUuid: null,
        recaptchaToken: token,
      };

      await registerUser(payload);
      toast.success("User created. Verification email sent.");

      setFirstName("");
      setLastName("");
      setEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
      setMode("login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      // Use v2 for testing
      const token = await handleV2Challenge();

      await loginUser({ email, password: loginPassword, recaptchaToken: token });
      toast.success("Logged in successfully!");
      await fetchUser();
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsResetting(true);

    try {
      // Use v2 for testing
      const token = await handleV2Challenge();
      if (!token) throw new Error("reCAPTCHA v2 failed");
      await sendPasswordResetEmail({ email, recaptchaToken: token });
      toast.success("Password reset email sent (if account exists).");
      setMode("login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setIsResetting(false);
    }
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div className="phone-horizontal max-w-[1600px] mx-auto w-screen min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-green-900 mb-2">
          {mode === "register"
            ? "Create Account"
            : mode === "reset"
            ? "Reset Password"
            : "Welcome Back"}
        </h1>

        <p className="text-center text-sm text-gray-600 mb-6">
          {mode === "register"
            ? "Sign up to manage your PrimCut services"
            : mode === "reset"
            ? "Enter your email to receive a password reset link"
            : "Login to your PrimCut account"}
        </p>

        {/* SLIDER */}
        <div className="overflow-hidden">
          <div
            className={`flex w-[300%] transition-transform duration-500 ${
              mode === "login"
                ? "translate-x-0"
                : mode === "register"
                ? "-translate-x-1/3"
                : "-translate-x-2/3"
            }`}
          >
            {/* LOGIN PANEL */}
            <div
              className={`w-1/3 p-0 transition-all duration-500 ease-in-out ${
                mode === "login" ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              <form className="space-y-4" autoComplete="off" onSubmit={handleLogin}>
                <div className="px-1">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-border w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                    required
                  />
                </div>

                <div className="relative px-1">
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type={loginPasswordVisible ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="input-border w-full border rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-700"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-9 text-gray-500 text-xl"
                    onClick={() => setLoginPasswordVisible(!loginPasswordVisible)}
                  >
                    {loginPasswordVisible ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* v2 container */}
                <div id="recaptcha-v2-container" className="my-2"></div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className={`w-full mt-5 py-2 rounded-md font-bold transition hover:cursor-pointer ${
                    isLoggingIn ? "bg-gray-400 text-white" : "bg-green-900 text-white hover:bg-green-800"
                  }`}
                >
                  {isLoggingIn ? "Logging in..." : "Login"}
                </button>

                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="text-green-800 font-semibold hover:underline hover:cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            </div>

            {/* REGISTER PANEL */}
            <div
              className={`w-1/3 p-0 transition-all duration-500 ease-in-out ${
                mode === "register" ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              <form className="space-y-4" autoComplete="off" onSubmit={handleRegister}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-1">
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input-border w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                      required
                    />
                  </div>
                  <div className="px-1">
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="input-border w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                      required
                    />
                  </div>
                </div>

                <div className="px-1">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-border w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                    required
                  />
                </div>

                <div className="relative px-1">
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type={registerPasswordVisible ? "text" : "password"}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="input-border w-full border rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-700"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-9 text-gray-500 text-xl"
                    onClick={() => setRegisterPasswordVisible(!registerPasswordVisible)}
                  >
                    {registerPasswordVisible ? "🙈" : "👁️"}
                  </button>
                  <PasswordStrengthBar password={registerPassword} />
                </div>

                <div className="relative px-1">
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-border w-full border rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-700"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-9 text-gray-500 text-xl"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  >
                    {confirmPasswordVisible ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* v2 container */}
                <div id="recaptcha-v2-container" className="my-2"></div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className={`w-full mt-5 py-2 rounded-md font-bold transition hover:cursor-pointer ${
                    isRegistering ? "bg-gray-400 text-white" : "bg-green-900 text-white hover:bg-green-800"
                  }`}
                >
                  {isRegistering ? "Creating account..." : "Create Account"}
                </button>
              </form>
            </div>

            {/* RESET PANEL */}
            <div
              className={`w-1/3 p-0 transition-all duration-500 ease-in-out ${
                mode === "reset" ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              <form className="space-y-4" autoComplete="off" onSubmit={handleReset}>
                <div className="px-1">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-border w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                    required
                  />
                </div>

                <p className="text-xs text-gray-500 px-1">
                  If an account exists with that email, a password reset link will be sent.
                </p>

                {/* v2 container */}
                <div id="recaptcha-v2-container" className="my-2"></div>

                <button
                  type="submit"
                  disabled={isResetting}
                  className={`w-full mt-5 py-2 rounded-md font-bold transition hover:cursor-pointer ${
                    isResetting ? "bg-gray-400 text-white" : "bg-green-900 text-white hover:bg-green-800"
                  }`}
                >
                  {isResetting ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-green-800 font-semibold hover:underline"
                  >
                    Back to login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* TOGGLE */}
        <div className="text-center mt-4 text-sm">
          {mode === "register" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-green-800 font-semibold hover:underline hover:cursor-pointer"
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-green-800 font-semibold hover:underline hover:cursor-pointer"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
