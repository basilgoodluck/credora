import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthProvider } from "../components/AuthProvider";
import "../styles.css";

export const metadata: Metadata = {
  title: "Credora",
  description: "Assess informal worker creditworthiness from verifiable evidence.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}