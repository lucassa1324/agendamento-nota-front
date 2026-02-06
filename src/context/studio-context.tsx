"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { SiteConfigData } from "@/components/admin/site_editor/hooks/use-site-editor";
import { API_BASE_URL, BASE_DOMAIN } from "@/lib/auth-client";
import type { Business } from "@/lib/booking-data";
import { siteCustomizerService } from "@/lib/site-customizer-service";

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

  const updateStudioInfo = useCallback((updates: Partial<Business>) => {
    setStudio((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

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
        console.log(
          `>>> [StudioProvider] Analisando HOST para extração de SLUG: ${host}`,
        );

        // Caso especial para desenvolvimento: subdomínio em localhost (ex: lucas-studio.localhost:3000)
        if (host.includes(".localhost")) {
          const parts = host.split(".");
          if (parts.length > 1 && parts[0] !== "www") {
            currentSlug = parts[0];
            console.log(
              `>>> [StudioProvider] SLUG extraído do subdomínio LOCALHOST: ${currentSlug}`,
            );
            setSlug(currentSlug);
          }
        }
        // Caso para produção: subdomínio do BASE_DOMAIN
        else if (
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
            console.log(
              `>>> [StudioProvider] SLUG extraído do subdomínio PRODUÇÃO: ${currentSlug}`,
            );
            setSlug(currentSlug);
          }
        }
      }

      if (!currentSlug) {
        setIsLoading(false);
        return;
      }

      try {
        const fetchUrl = `${API_BASE_URL}/api/business/slug/${currentSlug}`;
        console.log(`>>> [StudioProvider] Buscando studio via: ${fetchUrl}`);

        const response = await fetch(fetchUrl, {
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          // Blindagem contra JSON vazio ou malformado
          const text = await response.text();
          console.log(">>> [StudioProvider] Resposta bruta do servidor:", text);

          if (!text || text.trim() === "") {
            throw new Error("Resposta do servidor está vazia.");
          }

          try {
            const data = JSON.parse(text);
            console.log(
              ">>> [StudioProvider] Dados do studio carregados com sucesso:",
              data?.id,
            );
            setStudio(data);

            // Busca de customização SEM CACHE para refletir alterações imediatamente no visitante
            if (data?.id) {
              try {
                const customization =
                  await siteCustomizerService.getCustomization(data.id);
                console.log(
                  ">>> [StudioProvider] Customização carregada diretamente do banco para empresa:",
                  data.id,
                );

                // Mapeamento flexível para garantir que cores e fontes do layoutGlobal sejam aplicadas
                const config = customization as SiteConfigData;
                const layoutGlobal = config.layoutGlobal || config.layout_global;
                const mappedConfig = {
                  ...config,
                  colors:
                    config.colors ||
                    layoutGlobal?.siteColors ||
                    layoutGlobal?.cores_base,
                  theme:
                    config.theme || config.typography || layoutGlobal?.fontes,
                };

                updateStudioInfo({
                  config: mappedConfig as Business["config"],
                });
              } catch (custErr) {
                console.error(
                  ">>> [StudioProvider] Falha ao carregar customização sem cache:",
                  custErr,
                );
              }
            }
          } catch (parseErr) {
            console.error(
              ">>> [StudioProvider] Erro ao processar JSON:",
              parseErr,
            );
            throw new Error("Resposta do servidor não é um JSON válido.");
          }
        } else {
          const errorText = await response
            .text()
            .catch(() => "Sem detalhes no corpo da resposta");
          console.error(
            `>>> [StudioProvider] Resposta do servidor não foi OK:`,
            {
              status: response.status,
              statusText: response.statusText,
              details: errorText,
              url: response.url,
            },
          );

          if (response.status === 404) {
            setError("Studio não encontrado");
          } else {
            setError(`Erro do servidor (${response.status})`);
          }
        }
      } catch (err: unknown) {
        const fetchUrl = `${API_BASE_URL}/api/business/slug/${currentSlug}`;
        const currentOrigin =
          typeof window !== "undefined" ? window.location.origin : "N/A";

        const errorDetails = err as { stack?: string; cause?: unknown };

        console.error(
          ">>> [StudioProvider] ERRO CRÍTICO de rede ou processamento:",
          {
            message: err instanceof Error ? err.message : "Erro desconhecido",
            stack: errorDetails.stack,
            cause: errorDetails.cause,
            api_url: API_BASE_URL,
            fetch_url: fetchUrl,
            current_origin: currentOrigin,
            slug: currentSlug,
          },
        );

        // Log detalhado do erro para inspeção no console do navegador
        console.dir(err);
        setError(
          err instanceof Error
            ? err.message
            : "Erro de conexão com o servidor.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudio();
  }, [slug, updateStudioInfo]);

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
