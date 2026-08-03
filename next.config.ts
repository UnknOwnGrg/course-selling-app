import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "z77dnsrwbe.ufs.sh",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
