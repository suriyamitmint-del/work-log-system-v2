"use client";

import { SessionProvider } from "next-auth/react";
import AutoLogout from "./AutoLogout";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AutoLogout />
      {children}
    </SessionProvider>
  );
}
