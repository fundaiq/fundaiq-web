"use client";

import { useEffect, useState } from "react";
import { setAccessToken, API_BASE } from "@/app/lib/api";

export default function SessionBootstrap() {
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  useEffect(() => {
    // Only run once
    if (isBootstrapped) return;

    const bootstrapSession = async () => {
      try {
        
        // Use the same URL construction as your api.ts
        const url = `${API_BASE}/auth/refresh`;
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const res = await fetch(url, {
          method: "POST",
          credentials: "include",
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (res.ok) {
          const data = await res.json();
          
          if (data?.access_token) {
            setAccessToken(data.access_token);
          } 
        } 
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.log("[SessionBootstrap] Request timeout");
          } else {
            console.log("[SessionBootstrap] Error:", error.message);
          }
        } else {
          console.log("[SessionBootstrap] Unknown error:", error);
        }
      } finally {
        setIsBootstrapped(true);
      }
    };

    bootstrapSession();
  }, [isBootstrapped]);

  return null;
}

// Named export for compatibility
export { SessionBootstrap };

// Additional export for different import patterns
export const SessionBootstrapComponent = SessionBootstrap;

