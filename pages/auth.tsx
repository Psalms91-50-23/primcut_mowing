import React, { useState, useEffect } from "react";
import PasswordStrengthBar from "react-password-strength-bar";
import { toast } from "react-hot-toast";
import { useAuth, roleRedirectMap } from "../context/AuthContext";
import { useRouter } from "next/router";
import { useRecaptcha } from "../hooks/useRecaptcha";
import { registerUser, loginUser, sendPasswordResetEmail } from "../utils/utils";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const { loadV3, loadV2 } = useRecaptcha();
  const router = useRouter();
  const { login, loading, user } = useAuth();
  const [showV2, setShowV2] = useState(false);
  // -----------------------------
  // Form states
  // -----------------------------
  const [email, setEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // -----------------------------
  // Visibility & Loading states
  // -----------------------------
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [loginError, setLoginError] = useState<string | null>(null);

    useEffect(() => {
    if (loading) return;
    if (!loading && user) {
      const redirectUrl =
        typeof router.query.redirect === "string" && router.query.redirect.length > 0
          ? router.query.redirect
          : roleRedirectMap[user.role] || "/";
      router.replace(redirectUrl);
    }
  }, [user, loading, router.query.redirect, router]);

  //   useEffect(() => {
  //   if (loading) return; // wait until auth state is known
  //   if (!loading && user) {
  //     // User is already logged in → redirect to their dashboard
  //     const redirectUrl = roleRedirectMap[user.role] || "/";
  //     router.replace(redirectUrl);
  //   }
  // }, [user, loading, router]);
  // -----------------------------
  // reCAPTCHA helpers
  // -----------------------------
  const getRecaptchaV3Token = async (action: string) => {
    if (!window.grecaptcha) {
      toast.error("reCAPTCHA not loaded");
      return null;
    }
    await new Promise<void>((resolve) => window.grecaptcha.ready(resolve));
    return await window.grecaptcha.execute(
      process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY!,
      { action }
    );
  };

  const handleV2Challenge = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) return reject("reCAPTCHA v2 not loaded");
      const container = document.getElementById("recaptcha-v2-container");
      if (!container) return reject("v2 container not found");

      window.grecaptcha.ready(() => {
        window.grecaptcha.render(container, {
          sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY!,
          size: "normal",
          callback: (token: string) => resolve(token),
        });
        setTimeout(() => reject("v2 challenge timed out"), 120000);
      });
    });
  };

  // -----------------------------
  // Header component
  // -----------------------------
  const Header = ({ mode }: { mode: "login" | "register" | "reset" }) => (
    <>
      <div className="w-full flex flex-col items-center mb-6 bg-green-800 py-3 rounded-t-2xl px-2">
        <h1 className="flex items-center font-bold text-2xl sm:text-3xl text-white">
          <span className="text-3xl sm:text-4xl translate-x-1">H</span>
          <span className="ml-1">
            <img
              src="/images/happy-house-1.png"
              alt="Happy Property Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 inline-block"
            />
          </span>
          <span className="text-3xl sm:text-4xl ">ppy Property</span>
        </h1>
      </div>

      <div className="py-3 px-2">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-green-900 mb-2">
          {mode === "register"
            ? "Create Account"
            : mode === "reset"
            ? "Reset Password"
            : "Welcome Back"}
        </h1>
        <p className="text-center text-gray-600 mt-2 text-xs sm:text-sm">
          {mode === "register"
            ? "Sign up to manage your Happy Property's account"
            : mode === "reset"
            ? "Enter your email to reset your password"
            : "Login to your Happy Property's account"}
        </p>
      </div>
    </>
  );

  // -----------------------------
  // LOGIN WITH V3 + V2 FALLBACK
  // -----------------------------
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      await loadV3();
      const token = await getRecaptchaV3Token("login");

      const loggedInUser = await login(email, loginPassword, token);

      if (!loggedInUser) {
        toast.error("Could not fetch user data.");
        return;
      }

      toast.success("Logged in successfully!");
      const redirectUrl =
        typeof router.query.redirect === "string" && router.query.redirect.length > 0
          ? router.query.redirect
          : roleRedirectMap[loggedInUser.role] || "/";

      router.replace(redirectUrl);
    } catch (err: any) {
      // -----------------------------
      // 🔥 V2 FALLBACK
      // -----------------------------
      if (err?.message === "RECAPTCHA_LOW_SCORE") {
        try {
          toast("Security check required...");
          setShowV2(true);
          await loadV2();
          const v2Token = await handleV2Challenge();
          const loggedInUser = await login(email, loginPassword, v2Token);

          if (!loggedInUser) {
            toast.error("Login failed.");
            return;
          }

          toast.success("Logged in successfully!");
          const redirectUrl =
            typeof router.query.redirect === "string" &&
            router.query.redirect.length > 0
              ? router.query.redirect
              : roleRedirectMap[loggedInUser.role] || "/";

          router.replace(redirectUrl);
        } catch {
          toast.error("Security verification failed.");
        }
      } else {
        toast.error(err instanceof Error ? err.message : "Login failed");
      }
    } finally {
      if (showV2) setShowV2(false);
      setIsLoggingIn(false);
    }
  };

  // -----------------------------
  // REGISTER WITH V3 + V2 FALLBACK
  // -----------------------------
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsRegistering(true);

    try {
      await loadV3();
      const token = await getRecaptchaV3Token("register");

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
    } catch (err: any) {
      // 🔥 V2 FALLBACK
      if (err?.message === "RECAPTCHA_LOW_SCORE") {
        try {
          toast("Security check required...");
          setShowV2(true);
          await loadV2();
          const v2Token = await handleV2Challenge();

          const payload = {
            firstName,
            lastName,
            email,
            password: registerPassword,
            role: "customer",
            customerUuid: null,
            recaptchaToken: v2Token,
          };

          await registerUser(payload);
          toast.success("User created. Verification email sent.");
          setFirstName("");
          setLastName("");
          setEmail("");
          setRegisterPassword("");
          setConfirmPassword("");
          setMode("login");
        } catch {
          toast.error("Security verification failed.");
        }
      } else {
        toast.error(err instanceof Error ? err.message : "Registration failed");
      }
    } finally {
      if (showV2) setShowV2(false);
      setIsRegistering(false);
    }
  };

  // -----------------------------
  // RESET WITH V3 + V2 FALLBACK
  // -----------------------------
  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsResetting(true);

    try {
      await loadV3();
      const token = await getRecaptchaV3Token("reset");

      await sendPasswordResetEmail({
        email,
        recaptchaToken: token,
        recaptchaVersion: "v3",
      });

      toast.success("Password reset email sent (if account exists).");
      setEmail("");
      setMode("login");
    } catch (err: any) {
      // 🔥 V2 FALLBACK
      if (err?.message === "RECAPTCHA_LOW_SCORE") {
        try {
          toast("Security check required...");
          setShowV2(true);
          await loadV2();
          const v2Token = await handleV2Challenge();
          
          await sendPasswordResetEmail({
            email,
            recaptchaToken: v2Token,
            recaptchaVersion: "v2",
          });

          toast.success("Password reset email sent (if account exists).");
          setEmail("");
          setMode("login");
        } catch {
          toast.error("Security verification failed.");
        }
      } else {
        toast.error(err instanceof Error ? err.message : "Reset failed");
      }
    } finally {
      if (showV2) setShowV2(false);
      setIsResetting(false);
    }
  };

  if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-700 border-solid"></div>
    </div>
  );
}

  // -----------------------------
  // JSX
  // -----------------------------
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-6 py-16">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/images/login.png')" }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl">
        {/* Header */}
        <Header mode={mode} />

        {/* Forms */}
        <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-b-lg shadow-xl p-6">
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
                className={`w-1/3 transition-all duration-500 ${
                  mode === "login" ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                <form className="space-y-4" autoComplete="off" onSubmit={handleLogin}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-border w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                      required
                    />
                  </div>

                  <div className="relative">
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
                      className="absolute right-2 top-8 text-gray-500 text-xl hover:cursor-pointer"
                      onClick={() => setLoginPasswordVisible(!loginPasswordVisible)}
                    >
                      {loginPasswordVisible ? "🙈" : "👁️"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className={`w-full mt-5 py-2 rounded-md font-bold transition ${
                      isLoggingIn
                        ? "bg-gray-400 text-white"
                        : "bg-green-900 text-white hover:bg-green-800 hover:cursor-pointer"
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
                className={`w-1/3 transition-all duration-500 ${
                  mode === "register" ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                <form className="space-y-4" autoComplete="off" onSubmit={handleRegister}>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="input-border w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                        required
                      />
                    </div>
                    <div>
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

                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-border w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                      required
                    />
                  </div>

                  <div className="relative">
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
                      className="absolute right-2 top-8 text-gray-500 text-xl"
                      onClick={() =>
                        setRegisterPasswordVisible(!registerPasswordVisible)
                      }
                    >
                      {registerPasswordVisible ? "🙈" : "👁️"}
                    </button>
                    <PasswordStrengthBar password={registerPassword} />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">
                      Confirm Password
                    </label>
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-border w-full border rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-700"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-8 text-gray-500 text-xl"
                      onClick={() =>
                        setConfirmPasswordVisible(!confirmPasswordVisible)
                      }
                    >
                      {confirmPasswordVisible ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {/* ✅ Invisible v2 container */}
                  <div
                    id="recaptcha-v2-container"
                    className={`my-2 ${showV2 ? "block" : "hidden"}`}
                  />

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className={`w-full mt-5 py-2 rounded-md font-bold transition hover:cursor-pointer ${
                      isRegistering
                        ? "bg-gray-400 text-white"
                        : "bg-green-900 text-white hover:bg-green-800"
                    }`}
                  >
                    {isRegistering ? "Creating account..." : "Create Account"}
                  </button>
                </form>
              </div>

              {/* RESET PANEL */}
              <div
                className={`w-1/3 transition-all duration-500 ${
                  mode === "reset" ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                <form className="space-y-4" autoComplete="off" onSubmit={handleReset}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-border w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                      required
                    />
                  </div>

                  <p className="text-xs text-gray-500">
                    If an account exists with that email, a password reset link will
                    be sent.
                  </p>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className={`w-full mt-5 py-2 rounded-md font-bold hover:cursor-pointer transition ${
                      isResetting
                        ? "bg-gray-400 text-white"
                        : "bg-green-900 text-white hover:bg-green-800"
                    }`}
                  >
                    {isResetting ? "Sending..." : "Send Reset Link"}
                  </button>

                  <div className="text-center mt-2">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-green-800 font-semibold hover:underline hover:cursor-pointer"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Toggle */}
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
    </div>
  );
}
