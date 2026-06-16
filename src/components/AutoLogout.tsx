"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export default function AutoLogout() {
  const { status } = useSession();

  useEffect(() => {
    // Only track idle time if the user is authenticated
    if (status !== "authenticated") return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // User is idle for 30 minutes
        signOut({ callbackUrl: "/login" });
      }, TIMEOUT_MS);
    };

    // Initialize timer
    resetTimer();

    // Events that reset the timer
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [status]);

  return null;
}
