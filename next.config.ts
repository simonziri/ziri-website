import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Deutsche Konvention: /impressum führt zur Imprint-Seite
      { source: "/impressum", destination: "/imprint", permanent: true },
    ];
  },
};

export default nextConfig;
