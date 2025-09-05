// frontend/src/app/auth/RegisterBlock.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Turnstile from "react-turnstile";
import { apiPublic } from "@/app/lib/api";

type Props = {
  /** Where to go after a successful login (after email verification). */
  nextUrl?: string;
};

export function RegisterBlock({ nextUrl = "/profile" }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tsToken, setTsToken] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Enable Turnstile in both dev and prod for testing
  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const ENV = (process.env.NEXT_PUBLIC_ENV || "dev").toLowerCase();
  const turnstileEnabled = !!TURNSTILE_SITE_KEY;

  const pwOk = useMemo(
    () => pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw),
    [pw]
  );
  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const nameOk = name.trim().length >= 2;
  const canSubmit = nameOk && emailOk && pwOk && (!turnstileEnabled || !!tsToken);

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setMsg(null);

    if (!nameOk || !emailOk || !pwOk) {
      setMsg("Please enter a valid name, email, and a strong password.");
      return;
    }
    if (turnstileEnabled && !tsToken) {
      setMsg("Please complete the security verification.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiPublic("/auth/register", {
        method: "POST",
        body: JSON.stringify({ 
          name, 
          email, 
          password: pw, 
          ts_token: tsToken || undefined 
        }),
      });

      setSuccess(true);
      setMsg(
        typeof res === "string"
          ? res
          : res?.message || "Registered. Please verify your email."
      );
    } catch (e: any) {
      const m = String(e?.message || "Sign up failed");
      if (m.toLowerCase().includes("already")) {
        setMsg(
          "This email is already registered. You can log in or resend the verification email."
        );
      } else if (m.toLowerCase().includes("failed to fetch")) {
        setMsg(
          "Network/CORS error. Check backend CORS and that it's running on http://localhost:8000."
        );
      } else {
        setMsg(m);
      }
      // Reset Turnstile on error
      if (turnstileEnabled) {
        setTsToken(null);
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" style={{width: '32px', height: '32px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
            Account Created Successfully!
          </h2>
          <p className="text-green-700 dark:text-green-300 mb-6 leading-relaxed">
            Your account has been created. Please check your email and verify your account to unlock all features.
          </p>
          <Link
            href={`/auth?tab=login&next=${encodeURIComponent(nextUrl)}`}
            className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3-3V7a3 3 0 013 3v1" />
            </svg>
            Continue to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Create your account</h2>
        <p className="text-secondary">Join thousands of smart investors</p>
      </div>

      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">Full Name</label>
          <input
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              name && !nameOk
                ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                : nameOk
                ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                : "border-default hover:border-gray-400 dark:hover:border-gray-500"
            } bg-surface text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent`}
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
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
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              pw && !pwOk
                ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                : pwOk
                ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                : "border-default hover:border-gray-400 dark:hover:border-gray-500"
            } bg-surface text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent`}
            placeholder="Create a strong password"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Requirements Checklist */}
        <div className="bg-surface-secondary rounded-xl p-4">
          <p className="text-sm font-medium text-secondary mb-2">Password requirements:</p>
          <div className="space-y-1">
            <div
              className={`flex items-center gap-2 text-sm ${
                nameOk ? "text-green-600 dark:text-green-400" : "text-tertiary"
              }`}
            >
              <svg className={`w-4 h-4 ${nameOk ? "text-green-500" : "text-gray-400"}`} style={{width: '16px', height: '16px'}} fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Name at least 2 characters
            </div>
            <div
              className={`flex items-center gap-2 text-sm ${
                emailOk ? "text-green-600 dark:text-green-400" : "text-tertiary"
              }`}
            >
              <svg className={`w-4 h-4 ${emailOk ? "text-green-500" : "text-gray-400"}`} style={{width: '16px', height: '16px'}} fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Valid email address
            </div>
            <div
              className={`flex items-center gap-2 text-sm ${
                pwOk ? "text-green-600 dark:text-green-400" : "text-tertiary"
              }`}
            >
              <svg className={`w-4 h-4 ${pwOk ? "text-green-500" : "text-gray-400"}`} style={{width: '16px', height: '16px'}} fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              8+ characters with uppercase, lowercase, and number
            </div>
          </div>
        </div>
      </div>

      {/* Turnstile */}
      {turnstileEnabled && (
        <div className="flex justify-center">
          <Turnstile
            sitekey={TURNSTILE_SITE_KEY}
            onVerify={(token) => {
              console.log("[RegisterBlock] Turnstile verified:", !!token);
              setTsToken(token);
            }}
            onExpire={() => {
              console.log("[RegisterBlock] Turnstile expired");
              setTsToken(null);
            }}
            onError={(error) => {
              console.error("[RegisterBlock] Turnstile error:", error);
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
            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
        }`}
        disabled={!canSubmit || loading}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin" style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Creating your account...
          </div>
        ) : (
          "Create Account"
        )}
      </button>

      {/* Error / Info Message */}
      {msg && (
        <div
          className={`p-4 rounded-xl ${
            success
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          <div className="flex items-start gap-2">
            <svg
              className={`w-5 h-5 flex-shrink-0 ${success ? "text-green-500" : "text-red-500"}`}
              style={{width: '20px', height: '20px'}}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {success ? (
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

      {/* Terms */}
      <p className="text-xs text-tertiary text-center">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-accent hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-accent hover:underline">
          Privacy Policy
        </Link>
      </p>
    </form>
  );
}