import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true,
  async rewrites() {
    const targetUrl =
      process.env.API_PROXY_TARGET_URL || "http://localhost:3001";
    return [
      // 1. Rota para Autenticação (Better Auth) - Mantém /api/auth no destino
      {
        source: "/api-proxy/api/auth/:path*",
        destination: `${targetUrl}/api/auth/:path*`,
      },
      // 2. Rota Geral da API (Busca de Estúdio, Logo, Mudança de Senha)
      {
        source: "/api-proxy/:path*",
        destination: `${targetUrl}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
