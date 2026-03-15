import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // TypeScript
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },

  // API Proxy to Express backend
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "http://localhost:5000/:path*",
        },
      ],
    };
  },

  // Image optimization
  images: {
    unoptimized: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  },

  // Experimental features
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
