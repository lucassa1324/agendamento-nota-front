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
import type { Business, ColorSettings, FontSettings, HeroSettings } from "@/lib/booking-data";
import {
  saveColorSettings,
  saveFontSettings,
  saveHeroSettings,
  saveHeaderSettings,
  saveFooterSettings,
  savePageVisibility,
  saveVisibleSections,
  saveServicesSettings,
  saveValuesSettings,
  saveGallerySettings,
  saveCTASettings,
} from "@/lib/booking-data";
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
        const timestamp = Date.now();
        const fetchUrl = `${API_BASE_URL}/api/business/slug/${currentSlug}?t=${timestamp}`;
        console.log(`>>> [CACHE_CHECK] StudioProvider buscando studio via: ${fetchUrl}`);

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

            // Helper para mapear configurações (Cores, Fontes, etc)
              const mapConfig = (customData: Record<string, unknown>): SiteConfigData => {
                const raw = (customData?.siteCustomization as Record<string, unknown>) || customData;
                 const config = raw as SiteConfigData;
                 const layoutGlobal = (config.layoutGlobal || config.layout_global || {}) as Record<string, unknown>;
                 const layoutColors = (layoutGlobal?.siteColors || layoutGlobal) as Record<string, unknown>;
                 
                 // Mapeamento ultra-flexível para o background e outras cores
                 const finalColors: ColorSettings = {
                   primary: (config.colors?.primary as string) || (layoutColors?.primary as string) || "#bf6e8a",
                   secondary: (config.colors?.secondary as string) || (layoutColors?.secondary as string) || "#4b5563",
                   background: (config.colors?.background as string) || (layoutColors?.background as string) || "#ffffff",
                   text: (config.colors?.text as string) || (layoutColors?.text as string) || "#111827",
                   accent: (config.colors?.accent as string) || (layoutColors?.accent as string) || "#bf6e8a",
                   buttonText: (config.colors?.buttonText as string) || (layoutColors?.buttonText as string) || "#ffffff",
                 };
 
                 return {
                   ...config,
                   colors: finalColors,
                   hero: (config.hero || layoutGlobal?.hero || (config as any).layout_global?.hero) as HeroSettings | undefined,
                   theme: (config.theme || config.typography || layoutGlobal?.fontes || layoutGlobal?.typography) as FontSettings | undefined,
                   visibleSections: (config.visibleSections || layoutGlobal?.visibleSections) as Record<string, boolean> | undefined,
                   pageVisibility: (config.pageVisibility || layoutGlobal?.pageVisibility) as Record<string, boolean> | undefined,
                 };
              };

            // Tenta mapear as configurações que JÁ VÊM na resposta do studio
            // O backend muitas vezes já entrega o 'siteCustomization' ou 'config' aqui
            const initialConfig = mapConfig((data.siteCustomization || data.config || data) as Record<string, unknown>);
            
            console.log(">>> [StudioProvider] Configuração inicial mapeada:", {
              hasConfig: !!initialConfig,
              hasColors: !!initialConfig.colors,
              primary: initialConfig.colors?.primary
            });

            const initialStudio = {
              ...data,
              config: initialConfig as unknown as Business["config"]
            };
            
            setStudio(initialStudio);
            try {
              const lg = (initialConfig.layoutGlobal || (initialConfig as any).layout_global) as Record<string, unknown> | undefined;
              const colors = (initialConfig.colors || lg?.siteColors || (lg as any)?.cores_base) as ColorSettings | undefined;
              const fonts = (initialConfig.theme || initialConfig.typography || (lg as any)?.fontes) as FontSettings | undefined;
              if (initialConfig.hero) saveHeroSettings(initialConfig.hero);
              if (initialConfig.header) saveHeaderSettings(initialConfig.header);
              if (initialConfig.footer) saveFooterSettings(initialConfig.footer);
              if (initialConfig.services) saveServicesSettings(initialConfig.services);
              if (initialConfig.values) saveValuesSettings(initialConfig.values);
              if (initialConfig.gallery) saveGallerySettings(initialConfig.gallery);
              if (initialConfig.cta) saveCTASettings(initialConfig.cta);
              if (initialConfig.pageVisibility) savePageVisibility(initialConfig.pageVisibility);
              if (initialConfig.visibleSections) saveVisibleSections(initialConfig.visibleSections);
              if (colors) saveColorSettings(colors);
              if (fonts) saveFontSettings(fonts);
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("DataReady"));
              }
            } catch (_) {}

            // Busca de customização EXTRA (sem cache) apenas para garantir atualização em tempo real
            if (data?.id) {
              siteCustomizerService.getCustomization(data.id)
                .then(customization => {
                  console.log(">>> [StudioProvider] Customização extra recebida.");
                  const mappedConfig = mapConfig(customization as unknown as Record<string, unknown>);
                  setStudio(prev => prev ? { ...prev, config: mappedConfig as unknown as Business["config"] } : null);
                  try {
                    const lg = (mappedConfig.layoutGlobal || (mappedConfig as any).layout_global) as Record<string, unknown> | undefined;
                    const colors = (mappedConfig.colors || lg?.siteColors || (lg as any)?.cores_base) as ColorSettings | undefined;
                    const fonts = (mappedConfig.theme || mappedConfig.typography || (lg as any)?.fontes) as FontSettings | undefined;
                    if (mappedConfig.hero) saveHeroSettings(mappedConfig.hero);
                    if (mappedConfig.header) saveHeaderSettings(mappedConfig.header);
                    if (mappedConfig.footer) saveFooterSettings(mappedConfig.footer);
                    if (mappedConfig.services) saveServicesSettings(mappedConfig.services);
                    if (mappedConfig.values) saveValuesSettings(mappedConfig.values);
                    if (mappedConfig.gallery) saveGallerySettings(mappedConfig.gallery);
                    if (mappedConfig.cta) saveCTASettings(mappedConfig.cta);
                    if (mappedConfig.pageVisibility) savePageVisibility(mappedConfig.pageVisibility);
                    if (mappedConfig.visibleSections) saveVisibleSections(mappedConfig.visibleSections);
                    if (colors) saveColorSettings(colors);
                    if (fonts) saveFontSettings(fonts);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new Event("DataReady"));
                    }
                  } catch (_) {}
                })
                .catch(custErr => {
                  // Se falhar (ex: 401), não tem problema, já temos os dados iniciais do fetchStudio
                  console.warn(
                    ">>> [StudioProvider] Usando apenas dados iniciais do studio. Customização extra falhou:",
                    custErr.message
                  );
                });
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
