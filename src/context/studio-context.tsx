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
  saveCTASettings,
  saveFontSettings,
  saveFooterSettings,
  saveGallerySettings,
  saveHeaderSettings,
  saveHeroSettings,
  savePageVisibility,
  saveServices,
  saveServicesSettings,
  saveValuesSettings,
  saveVisibleSections,
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

            // --- NOVO: Limpeza Preventiva e Log de IDs ---
            if (typeof window !== "undefined" && data?.id) {
              const savedBusinessId = localStorage.getItem("last_business_id");
              console.log(">>> [DEBUG_SYNC] Buscando config para ID:", data.id);

              if (savedBusinessId && savedBusinessId !== data.id) {
                console.log(
                  ">>> [DEBUG_SYNC] BusinessId alterado. Limpando localStorage antigo...",
                );
                // Limpa chaves de configuração para evitar conflito entre empresas
                const keysToClear = [
                  "heroSettings",
                  "fontSettings",
                  "colorSettings",
                  "headerSettings",
                  "footerSettings",
                  "servicesSettings",
                  "valuesSettings",
                  "gallerySettings",
                  "ctaSettings",
                  "pageVisibility",
                  "visibleSections",
                  "studioSettings",
                  "layoutGlobal",
                ];
                keysToClear.forEach((k) => {
                  localStorage.removeItem(k);
                });
              }
              localStorage.setItem("last_business_id", data.id);
            }
            // ---------------------------------------------

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
 
                 const configObj = config as Record<string, unknown>;
                 const layoutGlobalLegacy = configObj.layout_global as Record<string, unknown> | undefined;

                 const mappedResult = {
                   ...config,
                   colors: finalColors,
                   hero: (config.hero || layoutGlobal?.hero || layoutGlobalLegacy?.hero) as HeroSettings | undefined,
                   theme: (config.theme || config.typography || layoutGlobal?.fontes || layoutGlobal?.typography) as FontSettings | undefined,
                   visibleSections: (config.visibleSections || config.visible_sections || layoutGlobal?.visibleSections || layoutGlobal?.visible_sections) as Record<string, boolean> | undefined,
                   pageVisibility: (config.pageVisibility || config.page_visibility || layoutGlobal?.pageVisibility || layoutGlobal?.page_visibility) as Record<string, boolean> | undefined,
                   bookingSteps: (config.bookingSteps || config.booking_steps || config.appointmentFlow || config.appointment_flow || layoutGlobal?.bookingSteps || layoutGlobal?.appointmentFlow) as SiteConfigData["bookingSteps"],
                 };

                 console.log(">>> [DEBUG_SYNC] bookingSteps mapeado:", !!mappedResult.bookingSteps);
                 return mappedResult;
               };

            // Tenta mapear as configurações que JÁ VÊM na resposta do studio
            // O backend muitas vezes já entrega o 'siteCustomization' ou 'config' aqui
            const initialConfig = mapConfig((data.siteCustomization || data.config || data) as Record<string, unknown>);
            
            // NOVO: Persistência imediata do layoutGlobal no localStorage para sincronia com ThemeInjector
            if (typeof window !== "undefined") {
              const lg = (initialConfig.layoutGlobal || (initialConfig as Record<string, unknown>).layout_global || {}) as Record<string, unknown>;
              localStorage.setItem("layoutGlobal", JSON.stringify(lg));
              console.log(">>> [DEBUG_SYNC] layoutGlobal persistido no localStorage para ThemeInjector");
            }

            console.log(">>> [StudioProvider] Configuração inicial mapeada:", {
              hasConfig: !!initialConfig,
              hasColors: !!initialConfig.colors,
              primary: initialConfig.colors?.primary
            });

            const initialStudio: Business = {
                    ...data,
                    services: data.services || [], // Garante que services existe
                    config: initialConfig as unknown as Business["config"]
                  };
                  
                  setStudio(initialStudio);

                  // Busca serviços explicitamente se não vieram no objeto business
                  // Isso resolve o problema de serviços não aparecerem no site público
                  if (!data.services || data.services.length === 0) {
                    const servicesTimestamp = Date.now();
                    const servicesUrl = `${API_BASE_URL}/api/services/company/${data.id}?t=${servicesTimestamp}`;
                    console.log(`>>> [StudioProvider] Buscando serviços separadamente (Rota Pública): ${servicesUrl}`);
                    
                    // Removido credentials: "include" para evitar 401 em rotas públicas que não precisam de auth
                    fetch(servicesUrl)
                      .then(res => {
                        if (res.status === 401) {
                          console.warn(">>> [SITE_WARN] Acesso restrito à API de serviços (401). Usando dados locais/padrão.");
                          return null;
                        }
                        return res.ok ? res.json() : null;
                      })
                      .then(servicesData => {
                        if (Array.isArray(servicesData) && servicesData.length > 0) {
                          console.log(`>>> [StudioProvider] ${servicesData.length} serviços carregados com sucesso.`);
                          setStudio(prev => prev ? { ...prev, services: servicesData } : null);
                          
                          // Sincroniza com o cache local para outros componentes usarem
                          try {
                            saveServices(servicesData);
                            if (typeof window !== "undefined") {
                              window.dispatchEvent(new Event("DataReady"));
                            }
                          } catch (e) {
                            console.warn(">>> [StudioProvider] Falha ao sincronizar cache de serviços:", e);
                          }
                        } else if (servicesData === null) {
                          console.log(">>> [StudioProvider] API de serviços indisponível. Mantendo estado atual.");
                        }
                      })
                      .catch(err => console.warn(">>> [StudioProvider] Erro ao buscar serviços:", err));
                  }
            try {
              const lg = (initialConfig.layoutGlobal || (initialConfig as Record<string, unknown>).layout_global) as Record<string, unknown> | undefined;
              const colors = (initialConfig.colors || lg?.siteColors || (lg as Record<string, unknown>)?.cores_base) as ColorSettings | undefined;
              const fonts = (initialConfig.theme || initialConfig.typography || (lg as Record<string, unknown>)?.fontes) as FontSettings | undefined;
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
                .then((customization: SiteConfigData | null) => {
                  if (!customization || customization.isFallback) {
                    console.log(">>> [StudioProvider] Customização extra falhou ou retornou fallback. Mantendo configuração inicial.");
                    return;
                  }
                  console.log(">>> [StudioProvider] Customização extra recebida.");
                  const mappedConfig = mapConfig(customization as unknown as Record<string, unknown>);
                  
                  // Atualiza o estado global imediatamente (Reidratação de Estado)
                  setStudio(prev => {
                    const newStudio = prev ? { ...prev, config: mappedConfig as unknown as Business["config"] } : null;
                    console.log(">>> [DEBUG_SYNC] Estado Studio reidratado com novas cores:", 
                      mappedConfig.colors?.background || "N/A"
                    );
                    return newStudio;
                  });

                  try {
                    const lg = (mappedConfig.layoutGlobal || (mappedConfig as Record<string, unknown>).layout_global) as Record<string, unknown> | undefined;
                    
                    // Salva no localStorage para persistência e para disparar eventos para componentes que ouvem storage
                    if (lg) localStorage.setItem("layoutGlobal", JSON.stringify(lg));
                    
                    const colors = (mappedConfig.colors || lg?.siteColors || (lg as Record<string, unknown>)?.cores_base) as ColorSettings | undefined;
                    const fonts = (mappedConfig.theme || mappedConfig.typography || (lg as Record<string, unknown>)?.fontes) as FontSettings | undefined;
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
                .catch(err => console.warn(">>> [StudioProvider] Erro ao buscar customização extra:", err));
            }
          } catch (parseErr) {
            console.warn(
              ">>> [StudioProvider] Erro ao processar JSON:",
              parseErr,
            );
            throw new Error("Resposta do servidor não é um JSON válido.");
          }
        } else {
          const errorText = await response
            .text()
            .catch(() => "Sem detalhes no corpo da resposta");
          console.warn(
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

        console.warn(
          ">>> [StudioProvider] AVISO: Falha na rede ou processamento do Studio:",
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
