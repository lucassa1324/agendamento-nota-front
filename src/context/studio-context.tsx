"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { API_BASE_URL, BASE_DOMAIN } from "@/lib/auth-client";
import type { Business } from "@/lib/booking-data";

interface StudioContextType {
  studio: Business | null;
  isLoading: boolean;
  error: string | null;
  slug: string | null;
  updateStudioInfo: (updates: Partial<Business>) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({
  children,
  initialSlug,
}: {
  children: ReactNode;
  initialSlug?: string;
}) {
  const [studio, setStudio] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(initialSlug || null);
  const router = useRouter();

  const updateStudioInfo = (updates: Partial<Business>) => {
    setStudio((prev) => (prev ? { ...prev, ...updates } : null));
  };

  useEffect(() => {
    if (initialSlug) {
      setSlug(initialSlug);
    }
  }, [initialSlug]);

  useEffect(() => {
    async function fetchStudio() {
      let currentSlug = slug;

      // Se não temos um slug inicial, tenta extrair do host
      if (!currentSlug && typeof window !== "undefined") {
        const host = window.location.host;

        // Verifica se estamos em um subdomínio do BASE_DOMAIN
        if (
          BASE_DOMAIN &&
          host.endsWith(BASE_DOMAIN) &&
          host !== BASE_DOMAIN &&
          host !== `www.${BASE_DOMAIN}`
        ) {
          const possibleSlug = host
            .replace(`.${BASE_DOMAIN}`, "")
            .replace("www.", "");
          if (possibleSlug) {
            currentSlug = possibleSlug;
            setSlug(currentSlug);
          }
        }
      }

      if (!currentSlug) {
        setIsLoading(false);
        return;
      }

      try {
        console.log(`>>> [StudioProvider] Buscando studio via: ${API_BASE_URL}/api/business/slug/${currentSlug}`);
        
        // Ajustado para /api/business/slug/ conforme novo padrão do back-end
        const response = await fetch(
          `${API_BASE_URL}/api/business/slug/${currentSlug}`,
          {
            credentials: "include",
            headers: {
              "Accept": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          console.log(">>> [StudioProvider] Dados do studio carregados com sucesso:", data?.id);
          setStudio(data);
        } else {
          const errorText = await response.text().catch(() => "Sem detalhes no corpo da resposta");
          console.error(`>>> [StudioProvider] Resposta do servidor não foi OK:`, {
            status: response.status,
            statusText: response.statusText,
            details: errorText,
            url: response.url
          });

          if (response.status === 404) {
            setError("Studio não encontrado");
          } else {
            setError(`Erro do servidor (${response.status})`);
          }
        }
      } catch (err) {
        console.error(">>> [StudioProvider] ERRO CRÍTICO de rede ou CORS:", {
          message: err instanceof Error ? err.message : "Erro desconhecido",
          error: err,
          api_url: API_BASE_URL,
          slug: currentSlug
        });
        setError("Erro de conexão com o servidor. Verifique o CORS ou a URL da API.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudio();
  }, [slug]);

  useEffect(() => {
    if (error === "Studio não encontrado") {
      // Redireciona para uma página de erro ou home se o studio não existir
      // Podemos usar router.replace para não sujar o histórico
      router.replace("/404");
      console.warn("Studio não encontrado para o slug:", slug);
    }
  }, [error, slug, router]);

  return (
    <StudioContext.Provider
      value={{ studio, isLoading, error, slug, updateStudioInfo }}
    >
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error("useStudio deve ser usado dentro de um StudioProvider");
  }
  return context;
}
