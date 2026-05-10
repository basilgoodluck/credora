"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "../components/AuthProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // List of routes where Header + Footer should be hidden
  const authPaths = ["/login", "/signup", "/verify-otp", "/forgot-password"];
  const isAuthPage = authPaths.includes(pathname);

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {!isAuthPage && <Header />}
        <main className="flex-grow">{children}</main>
        {!isAuthPage && <Footer />}
      </div>
    </AuthProvider>
  );
}