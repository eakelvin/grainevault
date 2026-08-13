import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProvider } from "@/context/app-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ideas Vault — Startup Ideas, Researched on Autopilot",
  description:
    "A secure repository where you store startup ideas and AI agents passively research them for market validation, competitor analysis, and readiness scores.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
