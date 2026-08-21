import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "/home/levi/trace",
  },

  allowedDevOrigins: ["192.168.1.16"],
};

export default nextConfig;