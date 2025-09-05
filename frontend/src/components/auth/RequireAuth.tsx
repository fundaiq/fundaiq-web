// utils/auth-redirect.ts
// utils/auth-redirect.ts
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Safely redirects to a URL after login, with security checks
 * @param router - Next.js router instance
 * @param nextUrl - The URL to redirect to
 * @param fallback - Fallback URL if nextUrl is invalid (default: "/profile")
 */
export function safeAuthRedirect(
  router: AppRouterInstance, 
  nextUrl: string, 
  fallback: string = "/profile"
) {
  // Decode the URL in case it was encoded
  const decodedUrl = decodeURIComponent(nextUrl);
  
  
  
  // Security: Only allow internal paths to prevent open redirects
  if (isValidInternalPath(decodedUrl)) {
    
    router.push(decodedUrl);
  } else {
    
    router.push(fallback);
  }
}

/**
 * Checks if a path is a valid internal path for redirect
 * @param path - The path to validate
 * @returns true if the path is safe for internal redirect
 */
function isValidInternalPath(path: string): boolean {
  // Must start with / but not with // (protocol-relative URLs)
  if (!path.startsWith("/") || path.startsWith("//")) {
    return false;
  }
  
  // Block common dangerous patterns
  const dangerousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /\\/g, // Backslashes can be used for bypassing
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(path));
}

/**
 * Creates a login URL with the current page as the redirect target
 * @param currentPath - Current pathname
 * @param currentSearch - Current search params
 * @param loginPath - Login page path (default: "/auth")
 * @returns Complete login URL with next parameter
 */
export function createLoginUrl(
  currentPath: string,
  currentSearch: string,
  loginPath: string = "/auth"
): string {
  const currentUrl = `${currentPath}${currentSearch ? `?${currentSearch}` : ""}`;
  return `${loginPath}?next=${encodeURIComponent(currentUrl)}`;
}

/**
 * Hook for handling auth redirects with Next.js router
 */
export function useAuthRedirect() {
  return {
    safeRedirect: safeAuthRedirect,
    createLoginUrl,
    isValidInternalPath
  };
}