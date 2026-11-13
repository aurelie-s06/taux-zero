import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Build autonome : un dossier .next/standalone qui se lance avec `node server.js`
  // (utilisé par le Dockerfile pour la mise en ligne)
  output: "standalone",
  // N'annonce pas « X-Powered-By: Next.js »
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Interdit d'afficher l'application dans une iframe (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          // Le navigateur ne devine pas le type des fichiers
          { key: "X-Content-Type-Options", value: "nosniff" },
          // L'adresse des pages n'est pas transmise aux autres sites
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Aucun accès à la caméra, au micro ou à la position
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
