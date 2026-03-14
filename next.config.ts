import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
      localPatterns: [
        {
      pathname: "/**",
      search: "",
    },
      ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "crests.football-data.org",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      { hostname: "crests.football-data.org" },
      { protocol: "https", hostname: "images.fotmob.com" },
    ],
  },
};

export default nextConfig;
