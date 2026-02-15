import React, { useState, useEffect } from "react";
import PasswordStrengthBar from "react-password-strength-bar";
import { registerUser, loginUser, sendPasswordResetEmail } from "../utils/utils";
import { toast } from "react-hot-toast";
import { useAuth, roleRedirectMap, UserType } from "../context/AuthContext";
import { useRouter } from "next/router";
import { useRecaptcha } from "../hooks/useRecaptcha";

type Props = {};

export default function AuthPage(props: Props) {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const { loadV3, loadV2 } = useRecaptcha();
  const [loginError, setLoginError] = useState<string | null>(null);
  // Password visibility states
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const { fetchUser, login } = useAuth();
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
        const widgetId = window.grecaptcha.render(container, {
          sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY!,
          size: "invisible",
          callback: (token: string) => resolve(token),
        });

        // Optional: reject if not solved within 2 minutes
        setTimeout(() => reject("v2 challenge timed out"), 120000);
      });
    });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsRegistering(true);

    try {
      await loadV3();
      let token = await getRecaptchaV3Token("register");

      // Verify v3 token with backend
      const v3Res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-recaptcha-v3`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "register" }),
      }).then((r) => r.json());

      if (!v3Res.success) {
        toast("Suspicious activity detected. Please verify with reCAPTCHA.");
        await loadV2();
        token = await handleV2Challenge(); // fallback
      }

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

  // const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setIsLoggingIn(true);
    
  //   try {
  //     await loadV3();
  //     let token = await getRecaptchaV3Token("login");
  //     console.log({token})
  //     const v3Res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-recaptcha-v3`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ token, action: "login" }),
  //     }).then((r) => r.json());

  //     if (!v3Res.success) {
  //       toast("Suspicious activity detected. Please verify with reCAPTCHA.");
  //       await loadV2();
  //       token = await handleV2Challenge();
  //       console.log("v2 token:", token);
  //     }

  //     const { data: userloggedIn, error: loginError } = await loginUser({ email, password: loginPassword, recaptchaToken: token });
  //     console.log({userloggedIn}, "user logged in response")
  //     if (loginError) {
  //       console.log({loginError})
  //       toast.error(loginError);
  //       return;
  //     }
  //     toast.success("Logged in successfully!");
  //     await fetchUser();
  //     router.push("/dashboard");
  //   } catch (err: unknown) {
  //     toast.error(err instanceof Error ? err.message : "Login failed");
  //   } finally {
  //     setIsLoggingIn(false);
  //   }
  // };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null); // reset previous error

    try {
      // ⚡ Generate fresh v3 token immediately before sending
      await loadV3();
      const token = await getRecaptchaV3Token("login");
      console.log("v3 token:", token);

      const loggedInUser = await login(email, loginPassword, token);
      if (!loggedInUser) {
        toast.error("Could not fetch user data.");
        return;
      }
      console.log({loggedInUser})
     
      toast.success("Logged in successfully!");
          // ✅ Check if "redirect" query param exists
      const redirectUrl =
      typeof router.query.redirect === "string" && router.query.redirect.length > 0
        ? router.query.redirect
        : roleRedirectMap[loggedInUser.role] || "/";

      router.replace(redirectUrl);
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
      await loadV3();
      let token = await getRecaptchaV3Token("reset");
      let version: "v2" | "v3" = "v3";

      // Send token to backend password reset endpoint directly
      const data = await sendPasswordResetEmail({ 
        email, 
        recaptchaToken: token,
        recaptchaVersion: version
      });
      console.log({data}," prior to testing success")
      // If backend returns failure due to suspicious activity, fallback to v2
      if (!data.success) {
        toast("Suspicious activity detected. Please verify with reCAPTCHA.");
        await loadV2();
        token = await handleV2Challenge();
        version = "v2";
        console.log({token}, "not successful")
        await sendPasswordResetEmail({
          email,
          recaptchaToken: token,
          recaptchaVersion: version
        });
      }
      setEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
      toast.success("Password reset email sent (if account exists).");
      setMode("login");
      router.push("/auth");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setIsResetting(false);
    }
  };


  // const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setIsResetting(true);
  //   console.log("Resetting")
  //   try {
  //     await loadV3();
  //     let token = await getRecaptchaV3Token("reset");
  //     let version: "v2" | "v3" = "v3";
  //     console.log({token})
  //     const v3Res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-recaptcha-v3`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ token, action: "reset" }),
  //     }).then((r) => {
  //       console.log("v3Res response:", r);
  //       return r.json();
  //     });

  //     if (!v3Res.success) {
  //       toast("Suspicious activity detected. Please verify with reCAPTCHA.");
  //       await loadV2();
  //       version = "v2"; // mark fallback version
  //       token = await handleV2Challenge();
  //     }

  //     await sendPasswordResetEmail({ 
  //       email, 
  //       recaptchaToken: token,
  //       recaptchaVersion: version
  //    });
  //     toast.success("Password reset email sent (if account exists).");
  //     setMode("login");
  //   } catch (err: unknown) {
  //     toast.error(err instanceof Error ? err.message : "Reset failed");
  //   } finally {
  //     setIsResetting(false);
  //   }
  // };

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
                    className={`input-border w-full border rounded-md p-2 pr-10 focus:outline-none focus:ring-2 ${
                      loginError ? "border-red-500 focus:ring-red-500" : "focus:ring-green-700"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-9 text-gray-500 text-xl"
                    onClick={() => setLoginPasswordVisible(!loginPasswordVisible)}
                  >
                    {loginPasswordVisible ? "🙈" : "👁️"}
                  </button>
                  {loginError && (
                    <p className="text-red-500 text-xs mt-1">{loginError}</p>
                  )}
                </div>

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

                {/* v2 container for fallback */}
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
