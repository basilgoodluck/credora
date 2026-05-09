import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell, AuthProvider } from "../components/AuthProvider";
import "../styles.css";

export const metadata: Metadata = {
  title: "Credit Quotient",
  description: "Assess informal worker creditworthiness from verifiable evidence.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
