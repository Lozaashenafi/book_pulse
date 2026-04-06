import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// Configure the PWA wrapper
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // Disable PWA in development
  workboxOptions: {
    disableDevLogs: true,
  },
});

// Your existing Next.js config
const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      // Increase this to 4MB or 10MB depending on your needs
      bodySizeLimit: "10mb",
    },
  },
};

// Export the wrapped config
export default withPWA(nextConfig);