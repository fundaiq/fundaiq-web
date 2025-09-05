// app/auth/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { RegisterBlock } from "./RegisterBlock";
import { LoginBlock } from "./LoginBlock";
import styles from '@/styles/auth.module.css';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Where to go after successful auth
  const nextUrl = useMemo(() => {
    if (!mounted) return "/report"; // Fallback during SSR
    
    const next = searchParams.get("next");
    
    if (next) {
      // User was redirected here from a protected page
      // Validate the next URL to prevent open redirects
      if (next.startsWith("/") && !next.startsWith("//")) {
        console.log("[AuthPage] Using next URL from params:", next);
        return next;
      } else {
        console.warn("[AuthPage] Invalid next URL, using default:", next);
      }
    }
    
    // User came here directly (clicked "Sign In" button)
    // Default to report page
    console.log("[AuthPage] No next URL, using default: /report");
    return "/report";
  }, [searchParams, mounted]);

  // Check for success message
  const message = useMemo(() => {
    if (!mounted) return null;
    return searchParams.get("message");
  }, [searchParams, mounted]);

  // Optional: choose tab from URL ?tab=register or ?tab=login
  const initialTab = useMemo<"login" | "register">(() => {
    if (!mounted) return "login";
    
    const t = (searchParams.get("tab") || "login").toLowerCase();
    return t === "register" ? "register" : "login";
  }, [searchParams, mounted]);

  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);

  // Update tab if it changes in URL
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!mounted) {
    // Return a loading state during SSR to prevent hydration mismatch
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.authLogo}>
              <img src="/icon.png" alt="Funda-IQ" className={styles.authLogoIcon} />
              <h1 className={styles.authLogoText}>Funda-IQ</h1>
            </div>
            <div className="text-secondary">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Welcome Header */}
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>
            <img src="/icon.png" alt="Funda-IQ" className={styles.authLogoIcon} />
            <h1 className={styles.authLogoText}>Funda-IQ</h1>
          </div>
          <h2 className={styles.authTitle}>
            {activeTab === "login" ? "Welcome back!" : "Join Funda-IQ"}
          </h2>
          <p className={styles.authSubtitle}>
            {activeTab === "login" 
              ? "Sign in to access your investment dashboard"
              : "Create your account to start analyzing stocks"
            }
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className={`${styles.statusMessage} ${styles.statusSuccess}`}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className={styles.authTabs}>
          <button
            className={`${styles.authTab} ${activeTab === "login" ? styles.authTabActive : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Sign In
          </button>
          <button
            className={`${styles.authTab} ${activeTab === "register" ? styles.authTabActive : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Sign Up
          </button>
        </div>

        {/* Auth Forms */}
        {activeTab === "login" ? (
          <LoginBlock nextUrl={nextUrl} />
        ) : (
          <RegisterBlock nextUrl={nextUrl} />
        )}
      </div>
    </div>
  );
}