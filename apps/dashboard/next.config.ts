import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure serverless functions work on Vercel
  output: undefined, // Default output for Vercel (not 'export' or 'standalone')
};

export default nextConfig;
