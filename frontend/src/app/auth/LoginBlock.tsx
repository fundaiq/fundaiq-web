// app/auth/LoginBlock.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Turnstile from "react-turnstile";
import { login } from "@/app/lib/api";
import EnvDiagnostic from '@/components/EnvDiagnostic';
type Props = {
  /** Where to go after a successful login (defaults to /profile). Passed in from /auth/page.tsx via ?next=... */
  nextUrl?: string;
};

export function LoginBlock({ nextUrl = "/profile" }: Props) {
  const router = useRouter();
  console.log("[LoginBlock] Received nextUrl:", nextUrl);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tsToken, setTsToken] = useState<string | null>(null);

  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const ENV = (process.env.NEXT_PUBLIC_ENV || "dev").toLowerCase();
  
  // Enable Turnstile in both dev and prod for testing
  const turnstileEnabled = !!TURNSTILE_SITE_KEY;

  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const passwordOk = password.length > 0;

  const AUTH_DEBUG = process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";
  const dbg = (...a: any[]) => AUTH_DEBUG && console.log("[AUTH][login]", ...a);

  // Block submit until Turnstile is completed (if enabled)
  const canSubmit = emailOk && passwordOk && (!turnstileEnabled || !!tsToken);

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setMsg(null);

    if (!emailOk || !passwordOk) {
      setMsg("Please enter a valid email and password.");
      return;
    }

    if (turnstileEnabled && !tsToken) {
      setMsg("Please complete the security verification.");
      return;
    }

    setLoading(true);
    dbg("Attempting login with:", { email, remember, ts_token: tsToken });

    try {
      // Use the original API call format with individual parameters
      const res = await login(email, password, remember, tsToken || undefined);

      dbg("Login successful:", res);
      setMsg("Login successful! Redirecting...");
      
      // ✅ Trigger TopNav refresh 
      window.dispatchEvent(new Event('loginSuccess'));
      
      // Small delay to show success message
      setTimeout(() => {
        console.log("[LoginBlock] Redirecting to:", nextUrl);
        router.push(nextUrl);
      }, 1000);

    } catch (e: any) {
      dbg("Login failed:", e);
      const errorMsg = String(e?.message || "Login failed");
      
      if (errorMsg.toLowerCase().includes("invalid credentials")) {
        setMsg("Invalid email or password. Please try again.");
      } else if (errorMsg.toLowerCase().includes("verify")) {
        setMsg("Please verify your email address before logging in.");
      } else if (errorMsg.toLowerCase().includes("network") || errorMsg.toLowerCase().includes("fetch")) {
        setMsg("Connection error. Please check your internet connection and try again.");
      } else {
        setMsg(errorMsg);
      }

      // Reset Turnstile on error
      if (turnstileEnabled) {
        setTsToken(null);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {process.env.NODE_ENV === 'production' && <EnvDiagnostic />}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-primary mb-2">Welcome back</h2>
          <p className="text-secondary">Sign in to your account</p>
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">Email Address</label>
          <input
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              email && !emailOk
                ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                : emailOk
                ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                : "border-default hover:border-gray-400 dark:hover:border-gray-500"
            } bg-surface text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent`}
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">Password</label>
          <input
            type="password"
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              password && !passwordOk
                ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                : passwordOk
                ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                : "border-default hover:border-gray-400 dark:hover:border-gray-500"
            } bg-surface text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent`}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            disabled={loading}
          />
          <label htmlFor="remember" className="ml-2 block text-sm text-secondary">
            Keep me signed in
          </label>
        </div>

        {/* Turnstile */}
        {turnstileEnabled && (
          <div className="flex justify-center">
            <Turnstile
              sitekey={TURNSTILE_SITE_KEY}
              onVerify={(token) => {
                console.log("[LoginBlock] Turnstile verified:", !!token);
                setTsToken(token);
              }}
              onExpire={() => {
                console.log("[LoginBlock] Turnstile expired");
                setTsToken(null);
              }}
              onError={(error) => {
                console.error("[LoginBlock] Turnstile error:", error);
                setTsToken(null);
              }}
              options={{ appearance: "interaction-only" }}
              key={tsToken ? "verified" : "unverified"}
            />
          </div>
        )}

        {!turnstileEnabled && (
          <p className="text-xs text-tertiary text-center">
            ⚠️ Turnstile not configured. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY in your environment.
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${
            canSubmit && !loading
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
          }`}
          disabled={!canSubmit || loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Signing in...
            </div>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Error/Success Message */}
        {msg && (
          <div
            className={`p-4 rounded-xl ${
              msg.includes("successful")
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
            }`}
          >
            <div className="flex items-start gap-2">
              <svg
                className={`w-5 h-5 flex-shrink-0 ${
                  msg.includes("successful") ? "text-green-500" : "text-red-500"
                }`}
                style={{width: '20px', height: '20px'}}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {msg.includes("successful") ? (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
              <p className="text-sm">{msg}</p>
            </div>
          </div>
        )}

        {/* Forgot Password Link */}
        <p className="text-center text-sm text-tertiary">
          Forgot your password?{" "}
          <a href="/forgot-password" className="text-accent hover:underline">
            Reset it here
          </a>
        </p>
      </form>
    </>
  );
}