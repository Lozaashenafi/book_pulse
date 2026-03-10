import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      // Increase this to 4MB or 10MB depending on your needs
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
