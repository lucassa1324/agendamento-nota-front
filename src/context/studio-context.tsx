"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL, BASE_DOMAIN } from "@/lib/auth-client";
import type {
  Business,
  ColorSettings,
  CTASettings,
  FontSettings,
  FooterSettings,
  GallerySettings,
  HeaderSettings,
  HeroSettings,
  ServicesSettings,
  StorySettings,
  TeamSettings,
  TestimonialsSettings,
  ValuesSettings,
} from "@/lib/booking-data";
import {
  getStorageKey,
  saveAboutHeroSettings,
  saveBookingConfirmationSettings,
  saveBookingDateSettings,
  saveBookingFormSettings,
  saveBookingServiceSettings,
  saveBookingTimeSettings,
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
  saveSiteProfile,
  saveStorySettings,
  saveTeamSettings,
  saveTestimonialsSettings,
  saveValuesSettings,
  saveVisibleSections,
} from "@/lib/booking-data";
import type { SiteConfigData } from "@/lib/site-config-types";
import { siteCustomizerService } from "@/lib/site-customizer-service";

interface StudioContextType {
  studio: Business | null;
  isLoading: boolean;
  error: string | null;
  slug: string | null;
  businessId: string | null;
  updateStudioInfo: (updates: Partial<Business>) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({
  children,
  initialSlug,
  initialId,
}: {
  children: ReactNode;
  initialSlug?: string;
  initialId?: string;
}) {
  const [studio, setStudio] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(initialSlug || null);
  const [businessId, setBusinessId] = useState<string | null>(
    initialId || null,
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = useCallback(() => {
    console.log(">>> [STUDIO_CONTEXT] Forçando atualização de dados...");
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleGlobalUpdate = () => {
        console.log(
          ">>> [CACHE] Sinal de publicação recebido. Forçando atualização do contexto...",
        );
        refreshData();
      };
      window.addEventListener("site-published-success", handleGlobalUpdate);
      return () =>
        window.removeEventListener(
          "site-published-success",
          handleGlobalUpdate,
        );
    }
  }, [refreshData]);
  // const router = useRouter();
  const pathname = usePathname();
  const isPreview =
    typeof window !== "undefined" &&
    window.location.search.includes("preview=true");
  const isAdminPath = pathname?.startsWith("/admin") ?? false;

  const updateStudioInfo = useCallback((updates: Partial<Business>) => {
    setStudio((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const mapConfig = useCallback(
    (customData: Record<string, unknown>): SiteConfigData => {
      const rawCandidate = customData as Record<string, unknown>;
      const hasDirectConfig =
        "layoutGlobal" in rawCandidate ||
        "layout_global" in rawCandidate ||
        "home" in rawCandidate ||
        "hero" in rawCandidate ||
        "heroBanner" in rawCandidate ||
        "colors" in rawCandidate ||
        "theme" in rawCandidate ||
        "typography" in rawCandidate;
      const raw = hasDirectConfig
        ? rawCandidate
        : (customData?.siteCustomization as Record<string, unknown>) ||
          customData;
      const config = raw as SiteConfigData;
      const layoutGlobal = (config.layoutGlobal ||
        config.layout_global ||
        {}) as Record<string, unknown>;
      const home = config.home as Record<string, Record<string, unknown>> | null;
      const layoutColors = (layoutGlobal?.siteColors || layoutGlobal) as Record<
        string,
        unknown
      >;

      const finalColors: ColorSettings = {
        primary:
          (layoutColors?.primary as string) ||
          (config.colors?.primary as string) ||
          "#bf6e8a",
        secondary:
          (layoutColors?.secondary as string) ||
          (config.colors?.secondary as string) ||
          "#4b5563",
        background:
          (layoutColors?.background as string) ||
          (config.colors?.background as string) ||
          "#ffffff",
        text:
          (layoutColors?.text as string) ||
          (config.colors?.text as string) ||
          "#111827",
        accent:
          (layoutColors?.accent as string) ||
          (config.colors?.accent as string) ||
          "#bf6e8a",
        buttonText:
          (layoutColors?.buttonText as string) ||
          (config.colors?.buttonText as string) ||
          "#ffffff",
      };

      return {
        ...config,
        colors: finalColors,
        hero: (layoutGlobal?.heroBanner ||
          layoutGlobal?.hero ||
          home?.heroBanner ||
          home?.hero ||
          (config as Record<string, unknown>).heroBanner ||
          config.hero) as HeroSettings | undefined,
        aboutHero: (layoutGlobal?.aboutHero || config.aboutHero) as
          | HeroSettings
          | undefined,
        story: (layoutGlobal?.story || config.story) as
          | StorySettings
          | undefined,
        team: (layoutGlobal?.team || config.team) as TeamSettings | undefined,
        testimonials: (layoutGlobal?.testimonials || config.testimonials) as
          | TestimonialsSettings
          | undefined,
        services: (layoutGlobal?.services ||
          home?.servicesSection ||
          home?.services ||
          config.services) as
          | ServicesSettings
          | undefined,
        values: (layoutGlobal?.values ||
          home?.valuesSection ||
          home?.values ||
          config.values) as
          | ValuesSettings
          | undefined,
        gallery: (layoutGlobal?.gallery ||
          home?.gallerySection ||
          home?.gallery ||
          config.gallery) as
          | GallerySettings
          | undefined,
        cta: (layoutGlobal?.cta ||
          home?.ctaSection ||
          home?.cta ||
          config.cta) as CTASettings | undefined,
        header: (layoutGlobal?.header || config.header) as
          | HeaderSettings
          | undefined,
        footer: (layoutGlobal?.footer || config.footer) as
          | FooterSettings
          | undefined,
        theme: (layoutGlobal?.fontes ||
          layoutGlobal?.typography ||
          config.theme ||
          config.typography) as FontSettings | undefined,
        visibleSections: (layoutGlobal?.visibleSections ||
          layoutGlobal?.visible_sections ||
          config.visibleSections ||
          config.visible_sections) as Record<string, boolean> | undefined,
        pageVisibility: (layoutGlobal?.pageVisibility ||
          layoutGlobal?.page_visibility ||
          config.pageVisibility ||
          config.page_visibility) as Record<string, boolean> | undefined,
        bookingSteps: (layoutGlobal?.bookingSteps ||
          layoutGlobal?.appointmentFlow ||
          config.bookingSteps ||
          config.booking_steps ||
          config.appointmentFlow ||
          config.appointment_flow) as SiteConfigData["bookingSteps"],
      };
    },
    [],
  );

  useEffect(() => {
    if (!isPreview || typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.type !== "UPDATE_SITE_DATA") return;

      const incoming =
        (event.data.data as Record<string, unknown>) ||
        (event.data.settings as Record<string, unknown>) ||
        (event.data.siteCustomization as Record<string, unknown>) ||
        (event.data.payload as Record<string, unknown>) ||
        (event.data as Record<string, unknown>);

      const mappedConfig = mapConfig(incoming);
      setStudio((prev) =>
        prev
          ? { ...prev, config: mappedConfig as unknown as Business["config"] }
          : prev,
      );

      const lg = (mappedConfig.layoutGlobal ||
        (mappedConfig as Record<string, unknown>).layout_global ||
        {}) as Record<string, unknown>;
      localStorage.setItem("layoutGlobal", JSON.stringify(lg));

      if (mappedConfig.hero) saveHeroSettings(mappedConfig.hero);
      if (mappedConfig.aboutHero) saveAboutHeroSettings(mappedConfig.aboutHero);
      if (mappedConfig.story) saveStorySettings(mappedConfig.story);
      if (mappedConfig.team) saveTeamSettings(mappedConfig.team);
      if (mappedConfig.testimonials)
        saveTestimonialsSettings(mappedConfig.testimonials);
      if (mappedConfig.services) saveServicesSettings(mappedConfig.services);
      if (mappedConfig.values) saveValuesSettings(mappedConfig.values);
      if (mappedConfig.gallery) saveGallerySettings(mappedConfig.gallery);
      if (mappedConfig.cta) saveCTASettings(mappedConfig.cta);
      if (mappedConfig.header) saveHeaderSettings(mappedConfig.header);
      if (mappedConfig.footer) saveFooterSettings(mappedConfig.footer);
      if (mappedConfig.visibleSections)
        saveVisibleSections(mappedConfig.visibleSections);
      if (mappedConfig.pageVisibility)
        savePageVisibility(mappedConfig.pageVisibility);
      if (mappedConfig.colors) saveColorSettings(mappedConfig.colors);
      if (mappedConfig.theme) saveFontSettings(mappedConfig.theme);

      if (mappedConfig.bookingSteps?.service)
        saveBookingServiceSettings(mappedConfig.bookingSteps.service);
      if (mappedConfig.bookingSteps?.date)
        saveBookingDateSettings(mappedConfig.bookingSteps.date);
      if (mappedConfig.bookingSteps?.time)
        saveBookingTimeSettings(mappedConfig.bookingSteps.time);
      if (mappedConfig.bookingSteps?.form)
        saveBookingFormSettings(mappedConfig.bookingSteps.form);
      if (mappedConfig.bookingSteps?.confirmation)
        saveBookingConfirmationSettings(mappedConfig.bookingSteps.confirmation);

      window.dispatchEvent(new Event("DataReady"));
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isPreview, mapConfig]);

  // --- NOVO: Sincronização de Fonte Única da Verdade (DB -> LocalStorage) ---
  useEffect(() => {
    if (isPreview) return;
    if (studio) {
      try {
        console.log(
          ">>> [STORAGE_SYNC] Sincronizando dados do Banco para LocalStorage...",
          {
            studioId: studio.id,
            slug: studio.slug,
            hasConfig: !!studio.config,
          },
        );

        // --- LOGO LEAK FIX: Limpeza de cache ao trocar de estúdio ---
        if (typeof window !== "undefined") {
          const lastSlug = localStorage.getItem("studio_last_slug");
          // Se temos um slug e ele mudou, limpamos o cache para evitar vazamento de dados
          if (studio.slug && lastSlug && lastSlug !== studio.slug) {
            console.log(
              `>>> [CONTEXT] Troca de estúdio detectada (${lastSlug} -> ${studio.slug}). Limpando cache sensível.`,
            );

            // Remove chaves específicas do usuário anterior
            localStorage.removeItem(getStorageKey("siteProfile"));
            localStorage.removeItem(getStorageKey("services"));
            localStorage.removeItem(getStorageKey("studioSettings"));

            // Remove chaves compartilhadas (legado/fallback)
            localStorage.removeItem("siteProfile");
            localStorage.removeItem("services");
            localStorage.removeItem("studioSettings");
          }

          // Atualiza o slug atual no storage
          if (studio.slug) {
            localStorage.setItem("studio_last_slug", studio.slug);
          }
        }

        // Sincronização do Perfil do Site - SOMENTE se tivermos dados válidos do banco
        const currentStoredProfile =
          typeof window !== "undefined"
            ? JSON.parse(
                localStorage.getItem(getStorageKey("siteProfile")) || "{}",
              )
            : {};

        // Função auxiliar para validar se uma string do banco não é vazia
        const getValidValue = (
          apiVal: string | undefined | null,
          storageVal: string,
        ) => {
          // Se o dado existe na API e não é apenas espaço em branco, PRIORIDADE TOTAL
          if (apiVal && apiVal.trim() !== "") {
            return apiVal.trim();
          }
          // Só retorna o storage se a API vier nula ou vazia
          return storageVal;
        };

        const profile = {
          name:
            studio.siteName?.trim() ||
            studio.name?.trim() ||
            currentStoredProfile.name ||
            "",
          description: getValidValue(
            studio.description,
            currentStoredProfile.description,
          ),
          phone: getValidValue(studio.phone, currentStoredProfile.phone),
          // E-MAIL: Prioridade absoluta para o dado do banco. Se existir, IGNORA o storage.
          email:
            studio.contact?.email && studio.contact.email.trim() !== ""
              ? studio.contact.email
              : studio.email && studio.email.trim() !== ""
                ? studio.email
                : currentStoredProfile.email,
          address: getValidValue(studio.address, currentStoredProfile.address),
          instagram: getValidValue(
            studio.instagram,
            currentStoredProfile.instagram,
          ),
          facebook: getValidValue(
            studio.facebook,
            currentStoredProfile.facebook,
          ),
          whatsapp: getValidValue(
            studio.whatsapp,
            currentStoredProfile.whatsapp,
          ),
          tiktok: getValidValue(studio.tiktok, currentStoredProfile.tiktok),
          linkedin: getValidValue(
            studio.linkedin,
            currentStoredProfile.linkedin,
          ),
          x: getValidValue(studio.x, currentStoredProfile.x),
          logoUrl: getValidValue(studio.logoUrl, currentStoredProfile.logoUrl),
          showInstagram:
            studio.showInstagram ?? currentStoredProfile.showInstagram ?? true,
          showFacebook:
            studio.showFacebook ?? currentStoredProfile.showFacebook ?? true,
          showWhatsapp:
            studio.showWhatsapp ?? currentStoredProfile.showWhatsapp ?? true,
          showTiktok:
            studio.showTiktok ?? currentStoredProfile.showTiktok ?? false,
          showLinkedin:
            studio.showLinkedin ?? currentStoredProfile.showLinkedin ?? false,
          showX: studio.showX ?? currentStoredProfile.showX ?? false,
        };

        // Log de verificação final antes de salvar
        if (profile.phone && profile.phone.trim() !== "") {
          console.log(">>> [FINAL_SYNC_CHECK] Telefone final:", profile.phone);
        }
        if (profile.email && profile.email.trim() !== "") {
          console.log(">>> [FINAL_SYNC_CHECK] Email final:", profile.email);
        }

        // Forçamos a sincronização sempre que houver um estúdio carregado
        console.log(
          ">>> [STORAGE_SYNC] Salvando perfil do site no storage:",
          profile,
        );
        saveSiteProfile(profile);

        if (studio.services && studio.services.length > 0) {
          console.log(
            `>>> [STORAGE_SYNC] Sincronizando ${studio.services.length} serviços...`,
          );

          // 1. Limpeza de dados antigos/órfãos para garantir frescor
          localStorage.removeItem("services");
          localStorage.removeItem("studioSettings");

          const userServicesKey = getStorageKey("services");
          const userSettingsKey = getStorageKey("studioSettings");

          if (userServicesKey !== "services")
            localStorage.removeItem(userServicesKey);
          if (userSettingsKey !== "studioSettings")
            localStorage.removeItem(userSettingsKey);

          // 2. Sincronização via helper saveServices
          saveServices(studio.services);

          // Dispara eventos para componentes
          window.dispatchEvent(new Event("servicesUpdated"));
          window.dispatchEvent(new Event("studioSettingsUpdated"));
        }

        console.log(">>> [STORAGE_SYNC] LocalStorage atualizado com sucesso.");
      } catch (err) {
        console.error(
          ">>> [STORAGE_SYNC] Erro ao sincronizar dados com LocalStorage:",
          err,
        );
      }
    }
  }, [isPreview, studio]);

  // --- NOVO: Sincronização do Título da Página (Aba do Navegador) ---
  useEffect(() => {
    if (studio && typeof window !== "undefined") {
      // Apenas acessando pathname para garantir que o efeito rode na troca de rota
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = pathname;

      const siteName = studio.siteName || studio.name || "Agendamento";
      const suffix = studio.titleSuffix?.trim();

      if (suffix) {
        // Verifica se o sufixo já começa com separador comum
        const hasSeparator = /^[-|–—]/.test(suffix);
        document.title = hasSeparator
          ? `${siteName} ${suffix}`
          : `${siteName} - ${suffix}`;
      } else {
        document.title = siteName;
      }
    }
  }, [studio, pathname]);
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (initialSlug) {
      setSlug(initialSlug);
    }
    if (initialId) {
      setBusinessId(initialId);
    }
  }, [initialSlug, initialId]);

  // --- NOVO: Listener para publicação bem sucedida ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePublishSuccess = () => {
      console.log(
        ">>> [StudioContext] Sinal de publicação recebido. Forçando atualização dos dados...",
      );
      // Incrementa o trigger para disparar o fetchStudio no useEffect principal
      setRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener("site-published-success", handlePublishSuccess);
    return () =>
      window.removeEventListener("site-published-success", handlePublishSuccess);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    if (isPreview) {
      if (typeof window !== "undefined") {
        const cachedStudio = localStorage.getItem("studio_data");
        if (cachedStudio) {
          try {
            setStudio(JSON.parse(cachedStudio));
          } catch (_) {
            setStudio(null);
          }
        }
      }
    }
    async function fetchStudio() {
      console.log(
        `>>> [StudioProvider] Buscando dados (trigger: ${refreshTrigger})...`,
      );
      let currentSlug = slug;
      let currentId = businessId;

      // EXCEÇÃO PARA ROTA MASTER: Se estivermos no painel master, não buscamos slug
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin/master")
      ) {
        console.log(
          ">>> [StudioProvider] Rota MASTER detectada. Pulando busca de slug de estúdio.",
        );
        setIsLoading(false);
        return;
      }

      // Se não temos um ID ou slug inicial, tenta extrair
      if (!currentId && !currentSlug && typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const slugParam = urlParams.get("slug");
        const idParam = urlParams.get("businessId") || urlParams.get("id");

        if (idParam) {
          currentId = idParam;
          setBusinessId(currentId);
        } else if (slugParam) {
          currentSlug = slugParam;
          console.log(
            `>>> [StudioProvider] SLUG extraído dos QUERY PARAMS: ${currentSlug}`,
          );
          setSlug(currentSlug);
        } else {
          // Tenta extrair da PATH (/admin/[slug]/...)
          const pathname = window.location.pathname;
          if (pathname.startsWith("/admin/")) {
            const segments = pathname.split("/").filter(Boolean);
            // O padrão é /admin/[slug]/...
            if (
              segments.length >= 2 &&
              segments[0] === "admin" &&
              segments[1] !== "master"
            ) {
              currentSlug = segments[1];
              console.log(
                `>>> [StudioProvider] SLUG extraído do PATH (/admin/[slug]): ${currentSlug}`,
              );
              setSlug(currentSlug);
            }
          }

          if (!currentSlug) {
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
        }
      }

      if (!currentId && !currentSlug) {
        setIsLoading(false);
        return;
      }

      try {
        const timestamp = Date.now();
        let fetchUrl: string;

        if (currentId) {
          fetchUrl = `${API_BASE_URL}/api/business/${currentId}?t=${timestamp}`;
          console.log(
            `>>> [CACHE_CHECK] StudioProvider buscando studio via ID: ${fetchUrl}`,
          );
        } else {
          // Normalização do slug para evitar erros de case-sensitivity e garantir consistência
          const finalSlug = (currentSlug || "").toLowerCase();
          fetchUrl = `${API_BASE_URL}/api/business/slug/${finalSlug}?t=${timestamp}`;
          console.log(
            `>>> [CACHE_CHECK] StudioProvider buscando studio via SLUG: ${fetchUrl}`,
          );
        }

        let response: Response;
        try {
          response = await customFetch(fetchUrl, {
            credentials: "include",
            cache: "no-store",
            next: { revalidate: 0 },
            signal,
            headers: {
              Accept: "application/json",
            },
          });
        } catch (fetchErr: unknown) {
          if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
            console.log(">>> [StudioProvider] Busca de studio cancelada.");
            return;
          }

          const errorMessage =
            fetchErr instanceof Error ? fetchErr.message : "Erro desconhecido";
          console.error(
            ">>> [StudioProvider] Falha Crítica na Rede ao buscar Studio:",
            errorMessage,
          );

          // PLANO B: Tentar carregar do cache local se a rede falhar
          const cachedStudio = localStorage.getItem("studio_data");
          if (cachedStudio) {
            console.log(
              ">>> [StudioProvider] Plano B: Carregando dados do LocalStorage devido a falha de rede.",
            );
            const parsed = JSON.parse(cachedStudio);
            setStudio(parsed);
            setIsLoading(false);
            return;
          }
          throw fetchErr; // Re-lança se não houver cache
        }

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
            console.log(
              ">>> [StudioProvider] Configuração bruta do studio:",
              data?.config,
            );
            // Log de depuração da resposta bruta da API do Studio
            console.log(">>> [DEBUG_API] Dados do Studio (Slug):", data);

            // --- NOVO: Chamada Adicional para Perfil Público ---
            let publicProfileData = null;
            if (data?.id) {
              try {
                console.log(
                  `>>> [DEBUG_API] Buscando perfil público para Business ID: ${data.id}`,
                );
                const profileRes = await customFetch(
                  `${API_BASE_URL}/api/settings/profile/${data.id}`,
                  {
                    cache: "no-store",
                    next: { revalidate: 0 },
                    signal,
                    headers: { Accept: "application/json" },
                  },
                );

                if (profileRes.ok) {
                  try {
                    const profileText = await profileRes.text();
                    if (profileText && profileText.trim() !== "") {
                      publicProfileData = JSON.parse(profileText);
                      console.log(
                        ">>> [DEBUG_API] Perfil público carregado com sucesso:",
                        publicProfileData,
                      );
                    } else {
                      console.warn(
                        ">>> [DEBUG_API] Perfil público retornou corpo vazio.",
                      );
                    }
                  } catch (jsonErr) {
                    console.error(
                      ">>> [DEBUG_API] Erro ao parsear JSON do perfil público:",
                      jsonErr,
                    );
                  }
                } else {
                  console.warn(
                    `>>> [DEBUG_API] Falha ao carregar perfil público: ${profileRes.status}`,
                  );
                }
              } catch (profileErr) {
                if (
                  profileErr instanceof Error &&
                  profileErr.name === "AbortError"
                ) {
                  return;
                }
                console.error(
                  ">>> [DEBUG_API] Erro na chamada do perfil público:",
                  profileErr,
                );
              }
            }

            // Mesclamos os dados do studio com os dados do perfil público de forma não destrutiva
            // Só sobrescrevemos se o dado do perfil público for válido (não vazio)
            // IMPORTANTE: Não sobrescrevemos campos de identificação ou configurações estruturais
            const studioWithProfile = { ...data };
            if (publicProfileData) {
              const protectedKeys = [
                "id",
                "slug",
                "email",
                "config",
                "services",
                "gallery",
                "testimonials",
                "createdAt",
                "updatedAt",
              ];

              Object.keys(publicProfileData).forEach((key) => {
                if (protectedKeys.includes(key)) return;

                const val = (publicProfileData as Record<string, unknown>)[key];
                const isPlaceholder =
                  typeof val === "string" &&
                  (val.includes("exemplo.com") ||
                    val.includes("lucasstudio.com"));

                if (
                  val !== null &&
                  val !== undefined &&
                  !isPlaceholder &&
                  (typeof val !== "string" || val.trim() !== "")
                ) {
                  (studioWithProfile as Record<string, unknown>)[key] = val;
                }
              });
            }

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

            const customizationResponse = data?.id
              ? await (isAdminPath || isPreview
                  ? siteCustomizerService.getDraftCustomization(data.id, signal)
                  : siteCustomizerService.getPublishedCustomization(data.id, signal))
              : null;

            if (signal.aborted) return;

            const initialConfig = mapConfig(
              ((customizationResponse && !customizationResponse.isFallback
                ? customizationResponse
                : data.siteCustomization || data.config || data) ??
                {}) as Record<string, unknown>,
            );

            // NOVO: Persistência imediata do layoutGlobal no localStorage para sincronia com ThemeInjector
            if (typeof window !== "undefined") {
              const lg = (initialConfig.layoutGlobal ||
                (initialConfig as Record<string, unknown>).layout_global ||
                {}) as Record<string, unknown>;
              localStorage.setItem("layoutGlobal", JSON.stringify(lg));
              console.log(
                ">>> [DEBUG_SYNC] layoutGlobal persistido no localStorage para ThemeInjector",
              );
            }

            console.log(">>> [StudioProvider] Configuração inicial mapeada:", {
              hasConfig: !!initialConfig,
              hasColors: !!initialConfig.colors,
              primary: initialConfig.colors?.primary,
            });

            const initialStudio: Business = {
              ...studioWithProfile,
              services: data.services || [], // Garante que services existe
              config: initialConfig as unknown as Business["config"],
            };

            setStudio(initialStudio);

            // 6. Guarda de Rota: Se o estúdio estiver inativo, redirecionar (Exceto para Master Admin)
            if (initialStudio.active === false) {
              if (
                typeof window !== "undefined" &&
                !window.location.pathname.startsWith("/admin/master")
              ) {
                console.error(
                  ">>> [STUDIO_GUARD] Estúdio inativo detectado no carregamento inicial. Redirecionando...",
                );
                window.location.href = "/acesso-suspenso";
                return;
              }
            }

            // Busca serviços explicitamente se não vieram no objeto business
            // Isso resolve o problema de serviços não aparecerem no site público
            if (!data.services || data.services.length === 0) {
              const servicesTimestamp = Date.now();
              const servicesUrl = `${API_BASE_URL}/api/services/company/${data.id}?t=${servicesTimestamp}`;
              console.log(
                `>>> [StudioProvider] Buscando serviços separadamente (Rota Pública): ${servicesUrl}`,
              );

              // Removido credentials: "include" para evitar 401 em rotas públicas que não precisam de auth
              customFetch(servicesUrl)
                .then((res) => {
                  if (res.status === 401) {
                    console.warn(
                      ">>> [SITE_WARN] Acesso restrito à API de serviços (401). Usando dados locais/padrão.",
                    );
                    return null;
                  }
                  return res.ok ? res.json() : null;
                })
                .then((servicesData) => {
                  if (Array.isArray(servicesData) && servicesData.length > 0) {
                    console.log(
                      `>>> [StudioProvider] ${servicesData.length} serviços carregados com sucesso.`,
                    );
                    setStudio((prev) =>
                      prev ? { ...prev, services: servicesData } : null,
                    );

                    // Sincroniza com o cache local para outros componentes usarem
                    try {
                      saveServices(servicesData);
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new Event("DataReady"));
                      }
                    } catch (e) {
                      console.warn(
                        ">>> [StudioProvider] Falha ao sincronizar cache de serviços:",
                        e,
                      );
                    }
                  } else if (servicesData === null) {
                    console.log(
                      ">>> [StudioProvider] API de serviços indisponível. Mantendo estado atual.",
                    );
                  }
                })
                .catch((err) =>
                  console.warn(
                    ">>> [StudioProvider] Erro ao buscar serviços:",
                    err,
                  ),
                );
            }
            try {
              const isEditor = isAdminPath || isPreview;

              const lg = (initialConfig.layoutGlobal ||
                (initialConfig as Record<string, unknown>).layout_global) as
                | Record<string, unknown>
                | undefined;
              const colors = (initialConfig.colors ||
                lg?.siteColors ||
                (lg as Record<string, unknown>)?.cores_base) as
                | ColorSettings
                | undefined;
              const fonts = (initialConfig.theme ||
                initialConfig.typography ||
                (lg as Record<string, unknown>)?.fontes) as
                | FontSettings
                | undefined;

              // Sincronização inteligente:
              // Se NÃO estiver no editor, os dados do banco SEMPRE sobrescrevem o cache local.
              // Isso garante que o site público reflita o banco imediatamente.
              const shouldOverride = !isEditor;

              if (initialConfig.hero && shouldOverride) {
                saveHeroSettings(initialConfig.hero);
              }
              if (initialConfig.header && shouldOverride)
                saveHeaderSettings(initialConfig.header);
              if (initialConfig.footer && shouldOverride)
                saveFooterSettings(initialConfig.footer);
              if (initialConfig.services && shouldOverride)
                saveServicesSettings(initialConfig.services);
              if (initialConfig.values && shouldOverride)
                saveValuesSettings(initialConfig.values);
              if (initialConfig.gallery && shouldOverride)
                saveGallerySettings(initialConfig.gallery);
              if (initialConfig.cta && shouldOverride)
                saveCTASettings(initialConfig.cta);
              if (initialConfig.pageVisibility && shouldOverride)
                savePageVisibility(initialConfig.pageVisibility);
              if (initialConfig.visibleSections && shouldOverride)
                saveVisibleSections(initialConfig.visibleSections);
              if (colors && shouldOverride)
                saveColorSettings(colors);
              if (fonts && shouldOverride)
                saveFontSettings(fonts);

              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("DataReady"));
              }
            } catch (_) {}

            // Busca de customização EXTRA (sem cache) apenas para garantir atualização em tempo real
            const extraCustomization =
              customizationResponse && !customizationResponse.isFallback
                ? customizationResponse
                : null;

            if (extraCustomization) {
              const mappedConfig = mapConfig(
                extraCustomization as unknown as Record<string, unknown>,
              );

              setStudio((prev) => {
                const newStudio = prev
                  ? {
                      ...prev,
                      config: mappedConfig as unknown as Business["config"],
                    }
                  : null;
                console.log(
                  ">>> [DEBUG_SYNC] Estado Studio reidratado com novas cores:",
                  mappedConfig.colors?.background || "N/A",
                );
                return newStudio;
              });

              try {
                const lg = (mappedConfig.layoutGlobal ||
                  (mappedConfig as Record<string, unknown>)
                    .layout_global) as Record<string, unknown> | undefined;

                if (lg) localStorage.setItem("layoutGlobal", JSON.stringify(lg));

                const colors = (mappedConfig.colors ||
                  lg?.siteColors ||
                  (lg as Record<string, unknown>)?.cores_base) as
                  | ColorSettings
                  | undefined;
                const fonts = (mappedConfig.theme ||
                  mappedConfig.typography ||
                  (lg as Record<string, unknown>)?.fontes) as
                  | FontSettings
                  | undefined;
                const isEditor = isAdminPath || isPreview;
                if (!isEditor) {
                  if (mappedConfig.hero) {
                    saveHeroSettings(mappedConfig.hero);
                  }
                  if (mappedConfig.header) saveHeaderSettings(mappedConfig.header);
                  if (mappedConfig.footer) saveFooterSettings(mappedConfig.footer);
                  if (mappedConfig.services)
                    saveServicesSettings(mappedConfig.services);
                  if (mappedConfig.values) saveValuesSettings(mappedConfig.values);
                  if (mappedConfig.gallery)
                    saveGallerySettings(mappedConfig.gallery);
                  if (mappedConfig.cta) saveCTASettings(mappedConfig.cta);
                  if (mappedConfig.pageVisibility)
                    savePageVisibility(mappedConfig.pageVisibility);
                  if (mappedConfig.visibleSections)
                    saveVisibleSections(mappedConfig.visibleSections);
                  if (colors) saveColorSettings(colors);
                  if (fonts) saveFontSettings(fonts);
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("DataReady"));
                  }
                }
              } catch (_) {}
            } else if (data?.id) {
              const fetcher = (companyId: string, signal?: AbortSignal) =>
                isAdminPath || isPreview
                  ? siteCustomizerService.getDraftCustomization(
                      companyId,
                      signal,
                    )
                  : siteCustomizerService.getPublishedCustomization(
                      companyId,
                      signal,
                    );

              fetcher(data.id, signal)
                .then((customization: SiteConfigData | null) => {
                  if (signal.aborted) return;
                  if (!customization || customization.isFallback) {
                    console.log(
                      ">>> [StudioProvider] Customização extra falhou ou retornou fallback. Mantendo configuração inicial.",
                    );
                    return;
                  }
                  console.log(
                    ">>> [StudioProvider] Customização extra recebida.",
                  );
                  const mappedConfig = mapConfig(
                    customization as unknown as Record<string, unknown>,
                  );

                  setStudio((prev) => {
                    const newStudio = prev
                      ? {
                          ...prev,
                          config: mappedConfig as unknown as Business["config"],
                        }
                      : null;
                    console.log(
                      ">>> [DEBUG_SYNC] Estado Studio reidratado com novas cores:",
                      mappedConfig.colors?.background || "N/A",
                    );
                    return newStudio;
                  });

                  try {
                    const lg = (mappedConfig.layoutGlobal ||
                      (mappedConfig as Record<string, unknown>)
                        .layout_global) as Record<string, unknown> | undefined;

                    if (lg)
                      localStorage.setItem("layoutGlobal", JSON.stringify(lg));

                    const colors = (mappedConfig.colors ||
                      lg?.siteColors ||
                      (lg as Record<string, unknown>)?.cores_base) as
                      | ColorSettings
                      | undefined;
                    const fonts = (mappedConfig.theme ||
                      mappedConfig.typography ||
                      (lg as Record<string, unknown>)?.fontes) as
                      | FontSettings
                      | undefined;
                    const isEditor = isAdminPath || isPreview;
                    if (!isEditor) {
                      if (mappedConfig.hero) {
                        saveHeroSettings(mappedConfig.hero);
                      }
                      if (mappedConfig.header)
                        saveHeaderSettings(mappedConfig.header);
                      if (mappedConfig.footer)
                        saveFooterSettings(mappedConfig.footer);
                      if (mappedConfig.services)
                        saveServicesSettings(mappedConfig.services);
                      if (mappedConfig.values)
                        saveValuesSettings(mappedConfig.values);
                      if (mappedConfig.gallery)
                        saveGallerySettings(mappedConfig.gallery);
                      if (mappedConfig.cta) saveCTASettings(mappedConfig.cta);
                      if (mappedConfig.pageVisibility)
                        savePageVisibility(mappedConfig.pageVisibility);
                      if (mappedConfig.visibleSections)
                        saveVisibleSections(mappedConfig.visibleSections);
                      if (colors) saveColorSettings(colors);
                      if (fonts) saveFontSettings(fonts);
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new Event("DataReady"));
                      }
                    }
                  } catch (_) {}
                })
                .catch((err) =>
                  console.warn(
                    ">>> [StudioProvider] Erro ao buscar customização extra:",
                    err,
                  ),
                );
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

        // Plano C: Se tudo falhar, tenta usar o que estiver no cache mesmo que o erro tenha sido após o fetch
        if (typeof window !== "undefined") {
          const cachedStudio = localStorage.getItem("studio_data");
          if (cachedStudio) {
            setStudio((prev) => {
              if (!prev) {
                console.log(
                  ">>> [StudioProvider] Plano C: Usando cache após erro de processamento.",
                );
                try {
                  return JSON.parse(cachedStudio);
                } catch (_) {
                  return prev;
                }
              }
              return prev;
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudio();

    return () => {
      controller.abort();
    };
  }, [slug, businessId, isPreview, isAdminPath, refreshTrigger, mapConfig]);

  useEffect(() => {
    // REMOVIDO: Redirecionamento automático para /404 ou home
    // O tratamento de erro agora é feito visualmente no render do provider
    if (error) {
      console.warn(">>> [StudioProvider] Erro detectado:", error);
    }
  }, [error]);

  // Monitora mudanças no status de ativação do estúdio (Guarda de Rota)
  useEffect(() => {
    if (studio && studio.active === false) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/admin/master") &&
        !window.location.pathname.startsWith("/acesso-suspenso")
      ) {
        console.error(
          ">>> [STUDIO_GUARD] Estúdio inativo detectado via monitoramento. Redirecionando...",
        );
        window.location.href = "/acesso-suspenso";
      }
    }
  }, [studio]);

  const value = useMemo(
    () => ({
      studio,
      isLoading,
      error,
      slug,
      businessId,
      updateStudioInfo,
    }),
    [studio, isLoading, error, slug, businessId, updateStudioInfo],
  );

  // Tratamento visual para erro 404 (Studio não encontrado)
  // Mas evitamos mostrar esse 404 para rotas de admin, permitindo que o admin-layout tome decisões
  if (
    !isLoading &&
    error === "Studio não encontrado" &&
    !pathname?.startsWith("/admin")
  ) {
    return (
      <StudioContext.Provider value={value}>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-6">Studio não encontrado</h2>
          <p className="text-zinc-500 mb-8 max-w-md">
            O estabelecimento que você está procurando não existe ou o endereço
            está incorreto.
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="px-6 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors"
          >
            Voltar para o início
          </button>
        </div>
      </StudioContext.Provider>
    );
  }

  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error("useStudio deve ser usado dentro de um StudioProvider");
  }
  return context;
}
