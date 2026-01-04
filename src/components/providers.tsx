
"use client";

import { AuthProvider } from "@/hooks/use-auth";
import type { ReactNode } from "react";
import { FirebaseClientProvider } from "@/firebase";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </FirebaseClientProvider>
  );
}
