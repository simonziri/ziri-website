import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const ttHoves = localFont({
  src: "../../TT_Hoves_Pro_VF_Trial.woff2",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
  variable: "--font-tt-hoves",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ZIRI Website 2026",
  description: "ZIRI website built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={ttHoves.variable} lang="en" data-theme="light-primary">
      <body>{children}</body>
    </html>
  );
}
