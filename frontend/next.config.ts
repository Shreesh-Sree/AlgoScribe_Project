import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export for Vercel deployment
  // output: 'export', // Commented out for Vercel
  trailingSlash: false, // Changed to false for better Vercel compatibility
  images: {
    unoptimized: true
  },
  // Ensure proper routing for Vercel
  experimental: {
    appDir: true
  }
};

export default nextConfig;
