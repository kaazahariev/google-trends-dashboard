import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/trends.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
