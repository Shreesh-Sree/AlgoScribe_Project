import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export for Vercel deployment
  // output: 'export', // Commented out for Vercel
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
