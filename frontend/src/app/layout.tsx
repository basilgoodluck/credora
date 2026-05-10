// app/layout.tsx
import { Inter } from "next/font/google";
import "../styles.css"
import ClientLayout from "./ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Credora - Your Credit Scoring Companion",
  description: "Your credit scoring companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}