import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static invitation pages are edited in place: always revalidate them so purchased invitations get fixes immediately
  async headers() {
    return [
      {
        source: "/invitations/:model/index.html",
        headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'mtokjpjajedhhdkgtegq.supabase.co',
      },
    ],
  },
};

export default nextConfig;
