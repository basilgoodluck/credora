"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "../components/AuthProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Pages that should NOT show header/footer (private / dashboard pages)
const HIDE_HEADER_FOOTER_PATHS = [
  "/dashboard",
  "/upload",
  "/cases",
  "/history",
  "/insights",
  "/reports",
  "/risk-analysis",
  "/settings",
  "/users",
  // Add any other protected routes here
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const shouldHide = HIDE_HEADER_FOOTER_PATHS.some(path => pathname === path || pathname?.startsWith(path + "/"));

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {!shouldHide && <Header />}
        <main className="flex-grow">{children}</main>
        {!shouldHide && <Footer />}
      </div>
    </AuthProvider>
  );
}