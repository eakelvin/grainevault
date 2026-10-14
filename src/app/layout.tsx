import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProvider } from "@/context/app-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const title = "SeedVault — AI Research for Startup Ideas";
const description =
  "Capture your raw ideas and let AI research the market, competitors, customers, trends, and risks — so you can see which ideas are worth pursuing.";

const logoAlt =
  "SeedVault logo — a vault with a spark, and the words SeedVault";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_URL?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      "http://localhost:3000"
  ),
  applicationName: "SeedVault",
  title: {
    default: title,
    template: "%s · SeedVault",
  },
  description,
  keywords: [
    "startup ideas",
    "market research",
    "competitor analysis",
    "idea validation",
    "TAM",
  ],
  icons: {
    icon: [{ url: "/images/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [
      { url: "/images/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SeedVault",
    title,
    description,
    images: [
      {
        url: "/images/og.png",
        width: 1280,
        height: 720,
        alt: logoAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [
      {
        url: "/images/og.png",
        width: 1280,
        height: 720,
        alt: logoAlt,
      },
    ],
  },
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
