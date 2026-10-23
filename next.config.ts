import type { NextConfig } from "next";

/** Identifiant de cette mise en ligne, fourni par Vercel (absent en local : rien n'est activé) */
const BUILD_VERSION = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || undefined;

const nextConfig: NextConfig = {
  // Chaque mise en ligne a son identifiant : un visiteur resté sur l'ancienne version est rechargé
  // sur la nouvelle à sa prochaine navigation (au lieu de garder l'ancien code)
  deploymentId: BUILD_VERSION,
  env: {
    NEXT_PUBLIC_BUILD_VERSION: BUILD_VERSION ?? "local",
  },
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
    formats: ['image/avif', 'image/webp'],
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
