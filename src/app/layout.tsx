import type { Metadata } from "next";
import localFont from "next/font/local";
import { RevealObserver } from "@/components/reveal-observer";
import "./globals.css";

const stackSans = localFont({
  src: "../../StackSansText-VariableFont_wght.woff2",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
  variable: "--font-stack-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ZIRI Website 2026",
  description: "ZIRI website built with Next.js.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html className={stackSans.variable} lang="en" data-theme="light-primary">
      <body>
        <RevealObserver />
        {children}
        {modal}
      </body>
    </html>
  );
}
