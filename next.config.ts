import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle canvas module for Konva.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
      };
    }

    // Exclude konva from server-side rendering
    config.externals = config.externals || [];
    config.externals.push({
      canvas: "canvas",
    });

    return config;
  },
};

export default nextConfig;
