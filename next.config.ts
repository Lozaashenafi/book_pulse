import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

// Storing the domain in a variable so it's clean to reuse
const supabaseDomain = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_DOMAIN || 'bnzaxrmcvkurtuxpmnvt.supabase.co';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://vercel.live;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://${supabaseDomain} https://www.transparenttextures.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://${supabaseDomain} wss://${supabaseDomain} https://vercel.live wss://ws-us3.pusher.com https://www.google-analytics.com;
    frame-src 'self' https://vercel.live;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`.replace(/\n/g, "").replace(/\s{2,}/g, " ").trim();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // 1. ADD THIS HEADERS SECTION
  async headers() {
    return [
      {
        source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_DOMAIN || 'bnzaxrmcvkurtuxpmnvt.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withPWA(nextConfig);