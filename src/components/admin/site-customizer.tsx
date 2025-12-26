"use client";

import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Info,
  Layout,
  type LucideIcon,
  Maximize,
  Monitor,
  RotateCcw,
  Settings2,
  Smartphone,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSidebar } from "@/context/sidebar-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./site_editor/sidebar-nav";

interface PageItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  hidden?: boolean;
}

import {
  type CTASettings,
  defaultCTASettings,
  defaultFontSettings,
  defaultGallerySettings,
  defaultHeroSettings,
  defaultServicesSettings,
  defaultValuesSettings,
  type FontSettings,
  type GallerySettings,
  getCTASettings,
  getFontSettings,
  getGallerySettings,
  getHeroSettings,
  getPageVisibility,
  getServicesSettings,
  getValuesSettings,
  getVisibleSections,
  type HeroSettings,
  type ServicesSettings,
  saveCTASettings,
  saveFontSettings,
  saveGallerySettings,
  saveHeroSettings,
  savePageVisibility,
  saveServicesSettings,
  saveValuesSettings,
  saveVisibleSections,
  type ValuesSettings,
} from "@/lib/booking-data";
import { TypographyEditor } from "./site_editor/layout/typography-editor";
import { CTAEditor } from "./site_editor/pages/home/cta-editor";
import { GalleryEditor } from "./site_editor/pages/home/gallery-editor";
import { HeroEditor } from "./site_editor/pages/home/hero-editor";
import { HistoryEditor } from "./site_editor/pages/home/history-editor";
import { ServicesEditor } from "./site_editor/pages/home/services-editor";
import { ValuesEditor } from "./site_editor/pages/home/values-editor";

const pages: PageItem[] = [
  { id: "layout", label: "Layout Global", icon: Settings2, path: "/" },
  { id: "inicio", label: "Início", icon: Layout, path: "/" },
  {
    id: "galeria",
    label: "Galeria",
    icon: ImageIcon,
    path: "/galeria",
    hidden: true,
  },
  { id: "sobre", label: "Sobre Nós", icon: Info, path: "/sobre", hidden: true },
  {
    id: "agendar",
    label: "Agendar",
    icon: Calendar,
    path: "/agendamento",
    hidden: true,
  },
];

const sections = {
  layout: [
    {
      id: "header",
      name: "Cabeçalho",
      description: "Logo e menu de navegação",
    },
    {
      id: "typography",
      name: "Tipografia",
      description: "Fontes e estilos de texto",
    },
    {
      id: "footer",
      name: "Rodapé",
      description: "Informações de contato e links",
    },
  ],
  inicio: [
    {
      id: "hero",
      name: "Banner Principal",
      description: "Primeira dobra com logo e botão de agendar",
    },
    {
      id: "services",
      name: "Nossos Serviços",
      description: "Lista de serviços em destaque",
    },
    {
      id: "values",
      name: "Nossos Valores",
      description: "Diferenciais e pilares do atendimento",
    },
    {
      id: "gallery-preview",
      name: "Prévia da Galeria",
      description: "Alguns trabalhos recentes",
    },
    {
      id: "cta",
      name: "Chamada para Ação",
      description: "Botão final para incentivar o agendamento",
    },
  ],
  galeria: [
    {
      id: "gallery-grid",
      name: "Grid de Fotos",
      description: "Todas as fotos do portfólio",
    },
  ],
  sobre: [
    {
      id: "about-hero",
      name: "Banner Sobre Nós",
      description: "Título e introdução da página",
    },
    {
      id: "story",
      name: "Nossa História",
      description: "Trajetória detalhada",
    },
    { id: "values", name: "Nossos Valores", description: "Pilares do studio" },
  ],
  agendar: [
    {
      id: "booking",
      name: "Fluxo de Agendamento",
      description: "Calendário e seleção de serviços",
    },
  ],
};

export function SiteCustomizer() {
  const { isSidebarOpen, setIsSidebarOpen: onToggleSidebar } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [activePage, setActivePage] = useState("layout");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedPages, setExpandedPages] = useState<string[]>([
    "layout",
    "inicio",
  ]);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [manualScale, setManualScale] = useState(1);
  const [isAutoZoom, setIsAutoZoom] = useState(true);
  const [manualWidth, setManualWidth] = useState<number | null>(null);

  // Carregamento inicial do localStorage (apenas no cliente)
  useEffect(() => {
    const savedPreviewMode = localStorage.getItem("sc_preview_mode");
    if (savedPreviewMode === "desktop" || savedPreviewMode === "mobile") {
      setPreviewMode(savedPreviewMode);
    }

    const savedManualScale = localStorage.getItem("sc_manual_scale");
    if (savedManualScale) {
      setManualScale(parseFloat(savedManualScale));
    }

    const savedIsAutoZoom = localStorage.getItem("sc_is_auto_zoom");
    if (savedIsAutoZoom !== null) {
      setIsAutoZoom(savedIsAutoZoom === "true");
    }

    const savedManualWidth = localStorage.getItem("sc_manual_width");
    if (savedManualWidth) {
      setManualWidth(parseInt(savedManualWidth, 10));
    }
  }, []);

  // Persistência de estados no localStorage
  useEffect(() => {
    localStorage.setItem("sc_preview_mode", previewMode);
  }, [previewMode]);

  useEffect(() => {
    localStorage.setItem("sc_manual_scale", manualScale.toString());
  }, [manualScale]);

  useEffect(() => {
    localStorage.setItem("sc_is_auto_zoom", isAutoZoom.toString());
  }, [isAutoZoom]);

  useEffect(() => {
    if (manualWidth !== null) {
      localStorage.setItem("sc_manual_width", manualWidth.toString());
    } else {
      localStorage.removeItem("sc_manual_width");
    }
  }, [manualWidth]);

  const [previewKey, setPreviewKey] = useState(0);
  const { toast } = useToast();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [headerPortalTarget, setHeaderPortalTarget] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    const target = document.getElementById("header-actions");
    if (target) {
      setHeaderPortalTarget(target);
    } else {
      const timeout = setTimeout(() => {
        setHeaderPortalTarget(document.getElementById("header-actions"));
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, []);

  // Estado para controlar a visibilidade das páginas
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(
    {},
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePageVisibilityChange = (pageId: string, isVisible: boolean) => {
    setPageVisibility((prev) => ({
      ...prev,
      [pageId]: isVisible,
    }));
  };

  // Notificamos o iframe sobre a mudança de visibilidade das páginas
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_PAGE_VISIBILITY",
          visibility: pageVisibility,
        },
        "*",
      );
    }
  }, [pageVisibility]);

  // Estados de customização (inicializados do storage)
  const [heroSettings, setHeroSettings] =
    useState<HeroSettings>(defaultHeroSettings);
  const [fontSettings, setFontSettings] =
    useState<FontSettings>(defaultFontSettings);
  const [servicesSettings, setServicesSettings] = useState<ServicesSettings>(
    defaultServicesSettings,
  );
  const [valuesSettings, setValuesSettings] = useState<ValuesSettings>(
    defaultValuesSettings,
  );
  const [gallerySettings, setGallerySettings] = useState<GallerySettings>(
    defaultGallerySettings,
  );
  const [ctaSettings, setCTASettings] =
    useState<CTASettings>(defaultCTASettings);

  // Estados para controle de botões (Aplicar vs Salvar)
  const [lastAppliedHero, setLastAppliedHero] =
    useState<HeroSettings>(defaultHeroSettings);
  const [lastAppliedFont, setLastAppliedFont] =
    useState<FontSettings>(defaultFontSettings);
  const [lastAppliedServices, setLastAppliedServices] =
    useState<ServicesSettings>(defaultServicesSettings);
  const [lastAppliedValues, setLastAppliedValues] = useState<ValuesSettings>(
    defaultValuesSettings,
  );
  const [lastAppliedGallery, setLastAppliedGallery] = useState<GallerySettings>(
    defaultGallerySettings,
  );
  const [lastAppliedCTA, setLastAppliedCTA] =
    useState<CTASettings>(defaultCTASettings);

  const [lastSavedHero, setLastSavedHero] =
    useState<HeroSettings>(defaultHeroSettings);
  const [lastSavedFont, setLastSavedFont] =
    useState<FontSettings>(defaultFontSettings);
  const [lastSavedServices, setLastSavedServices] = useState<ServicesSettings>(
    defaultServicesSettings,
  );
  const [lastSavedValues, setLastSavedValues] = useState<ValuesSettings>(
    defaultValuesSettings,
  );
  const [lastSavedGallery, setLastSavedGallery] = useState<GallerySettings>(
    defaultGallerySettings,
  );
  const [lastSavedCTA, setLastSavedCTA] =
    useState<CTASettings>(defaultCTASettings);

  const [lastSavedPageVisibility, setLastSavedPageVisibility] = useState<
    Record<string, boolean>
  >({});

  const [lastSavedVisibleSections, setLastSavedVisibleSections] = useState<
    Record<string, boolean>
  >({});

  const handleUpdateHero = useCallback((updates: Partial<HeroSettings>) => {
    setHeroSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateFont = useCallback((updates: Partial<FontSettings>) => {
    setFontSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateServices = useCallback(
    (updates: Partial<ServicesSettings>) => {
      setServicesSettings((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const handleUpdateValues = useCallback((updates: Partial<ValuesSettings>) => {
    setValuesSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateGallery = useCallback(
    (updates: Partial<GallerySettings>) => {
      setGallerySettings((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const handleUpdateCTA = useCallback((updates: Partial<CTASettings>) => {
    setCTASettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const loadedHero = getHeroSettings();
    const loadedFont = getFontSettings();
    const loadedServices = getServicesSettings();
    const loadedValues = getValuesSettings();
    const loadedGallery = getGallerySettings();
    const loadedCTA = getCTASettings();

    setHeroSettings(loadedHero);
    setFontSettings(loadedFont);
    setServicesSettings(loadedServices);
    setValuesSettings(loadedValues);
    setGallerySettings(loadedGallery);
    setCTASettings(loadedCTA);

    setLastAppliedHero(loadedHero);
    setLastAppliedFont(loadedFont);
    setLastAppliedServices(loadedServices);
    setLastAppliedValues(loadedValues);
    setLastAppliedGallery(loadedGallery);
    setLastAppliedCTA(loadedCTA);

    setLastSavedHero(loadedHero);
    setLastSavedFont(loadedFont);
    setLastSavedServices(loadedServices);
    setLastSavedValues(loadedValues);
    setLastSavedGallery(loadedGallery);
    setLastSavedCTA(loadedCTA);

    const loadedPageVisibility = getPageVisibility();
    const loadedVisibleSections = getVisibleSections();

    // Inicializar os estados de "último salvo" para comparação correta
    setLastSavedPageVisibility(loadedPageVisibility);
    setLastSavedVisibleSections(loadedVisibleSections);

    setPageVisibility(loadedPageVisibility);
    setVisibleSections(loadedVisibleSections);
  }, []);

  // Booleans para habilitar/desabilitar botões
  const hasHeroChanges =
    JSON.stringify(heroSettings) !== JSON.stringify(lastAppliedHero);
  const hasFontChanges =
    JSON.stringify(fontSettings) !== JSON.stringify(lastAppliedFont);
  const hasServicesChanges =
    JSON.stringify(servicesSettings) !== JSON.stringify(lastAppliedServices);
  const hasValuesChanges =
    JSON.stringify(valuesSettings) !== JSON.stringify(lastAppliedValues);
  const hasGalleryChanges =
    JSON.stringify(gallerySettings) !== JSON.stringify(lastAppliedGallery);
  const hasCTAChanges =
    JSON.stringify(ctaSettings) !== JSON.stringify(lastAppliedCTA);

  const hasUnsavedGlobalChanges = useMemo(() => {
    const heroChanged =
      JSON.stringify(lastAppliedHero) !== JSON.stringify(lastSavedHero);
    const fontChanged =
      JSON.stringify(lastAppliedFont) !== JSON.stringify(lastSavedFont);
    const servicesChanged =
      JSON.stringify(lastAppliedServices) !== JSON.stringify(lastSavedServices);
    const valuesChanged =
      JSON.stringify(lastAppliedValues) !== JSON.stringify(lastSavedValues);
    const galleryChanged =
      JSON.stringify(lastAppliedGallery) !== JSON.stringify(lastSavedGallery);
    const ctaChanged =
      JSON.stringify(lastAppliedCTA) !== JSON.stringify(lastSavedCTA);

    // Comparação baseada no estado efetivo de visibilidade (tratando undefined como true)
    const pageVisibilityChanged = pages.some((page) => {
      const current = pageVisibility[page.id] !== false;
      const saved = lastSavedPageVisibility[page.id] !== false;
      return current !== saved;
    });

    const visibleSectionsChanged = Object.values(sections)
      .flat()
      .some((section) => {
        const current = visibleSections[section.id] !== false;
        const saved = lastSavedVisibleSections[section.id] !== false;
        return current !== saved;
      });

    return (
      heroChanged ||
      fontChanged ||
      servicesChanged ||
      valuesChanged ||
      galleryChanged ||
      ctaChanged ||
      pageVisibilityChanged ||
      visibleSectionsChanged
    );
  }, [
    lastAppliedHero,
    lastSavedHero,
    lastAppliedFont,
    lastSavedFont,
    lastAppliedServices,
    lastSavedServices,
    lastAppliedValues,
    lastSavedValues,
    lastAppliedGallery,
    lastSavedGallery,
    lastAppliedCTA,
    lastSavedCTA,
    pageVisibility,
    lastSavedPageVisibility,
    visibleSections,
    lastSavedVisibleSections,
  ]);

  const resetSettings = useCallback(() => {
    if (
      confirm(
        "Tem certeza que deseja resetar todas as configurações para o padrão original?",
      )
    ) {
      setHeroSettings(defaultHeroSettings);
      setFontSettings(defaultFontSettings);
      setServicesSettings(defaultServicesSettings);
      setValuesSettings(defaultValuesSettings);
      setGallerySettings(defaultGallerySettings);
      setCTASettings(defaultCTASettings);
    }
  }, []);

  const handleSectionReset = useCallback(
    (sectionId: string) => {
      if (
        confirm(
          `Deseja resetar as configurações da seção "${sectionId}" para o padrão?`,
        )
      ) {
        switch (sectionId) {
          case "hero":
            setHeroSettings(defaultHeroSettings);
            break;
          case "typography":
            setFontSettings(defaultFontSettings);
            break;
          case "services":
            setServicesSettings(defaultServicesSettings);
            break;
          case "values":
            setValuesSettings(defaultValuesSettings);
            break;
          case "gallery-preview":
          case "gallery-grid":
            setGallerySettings(defaultGallerySettings);
            break;
          case "cta":
            setCTASettings(defaultCTASettings);
            break;
          default:
            toast({
              title: "Aviso",
              description:
                "Esta seção não possui configurações customizáveis para resetar.",
            });
            break;
        }
      }
    },
    [toast],
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Envia atualizações para o iframe quando as configurações do Hero mudarem
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_HERO_BG", // Mantendo o tipo para compatibilidade inicial
          ...heroSettings,
        },
        "*",
      );

      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_HERO_CONTENT",
          ...heroSettings,
        },
        "*",
      );
    }
  }, [heroSettings]);

  // Envia atualizações para o iframe quando as configurações de Serviços mudarem
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_SERVICES_CONTENT",
          settings: servicesSettings,
        },
        "*",
      );
    }
  }, [servicesSettings]);

  // Envia atualizações para o iframe quando as configurações de Valores mudarem
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_VALUES_CONTENT",
          settings: valuesSettings,
        },
        "*",
      );
    }
  }, [valuesSettings]);

  // Envia atualizações de fonte para o iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_FONTS",
          ...fontSettings,
        },
        "*",
      );
    }
  }, [fontSettings]);

  // Envia atualizações para a galeria
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_GALLERY_SETTINGS",
          settings: gallerySettings,
        },
        "*",
      );
    }
  }, [gallerySettings]);

  // Envia atualizações para a seção CTA
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_CTA_SETTINGS",
          settings: ctaSettings,
        },
        "*",
      );
    }
  }, [ctaSettings]);

  const activePageData = pages.find((p) => p.id === activePage);

  useEffect(() => {
    if (!containerRef.current) return;

    // Inicialização imediata do tamanho para evitar saltos
    const initialRect = containerRef.current.getBoundingClientRect();
    setContainerSize({
      width: initialRect.width,
      height: initialRect.height,
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const currentWidth =
    manualWidth ||
    (previewMode === "mobile" ? 375 : isAutoZoom ? containerSize.width : 1280);

  const widthScale =
    containerSize.width > 0
      ? Math.max(0.1, (containerSize.width - 24) / currentWidth)
      : 1;
  const heightScale =
    containerSize.height > 0
      ? Math.max(0.1, (containerSize.height - 24) / 850)
      : 1;
  const fitScaleDesktop = Math.min(1, widthScale, heightScale);
  const desktopScale = isAutoZoom
    ? previewMode === "desktop"
      ? 1
      : fitScaleDesktop
    : manualScale;

  const mobileWidthScale =
    containerSize.width > 0
      ? Math.max(0.1, (containerSize.width - 24) / (manualWidth || 375))
      : 1;
  const mobileHeightScale =
    containerSize.height > 0
      ? Math.max(0.1, (containerSize.height - 24) / 750)
      : 1;
  const fitScaleMobile = Math.min(1, mobileWidthScale, mobileHeightScale);
  const mobileScale = isAutoZoom ? fitScaleMobile : manualScale;

  useEffect(() => {
    // Notificamos o iframe sobre a mudança de visibilidade das seções
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_VISIBLE_SECTIONS",
          sections: visibleSections,
        },
        "*",
      );
    }
  }, [visibleSections]);

  const togglePageExpansion = (id: string) => {
    setExpandedPages((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
    setActivePage(id);
  };

  const toggleSection = (id: string) => {
    setVisibleSections((prev) => {
      const isCurrentlyVisible = prev[id] !== false;
      return { ...prev, [id]: !isCurrentlyVisible };
    });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    // Notificamos o iframe para destacar a seção
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "HIGHLIGHT_SECTION",
          sectionId: sectionId,
        },
        "*",
      );
    }
  };

  const handleHighlight = (elementId: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "HIGHLIGHT_SECTION",
          sectionId: elementId,
        },
        "*",
      );
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "HIGHLIGHT_SECTION") {
        setActiveSection(event.data.sectionId);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const reloadPreview = () => setPreviewKey((prev) => prev + 1);

  const activeSectionData = activeSection
    ? Object.values(sections)
        .flat()
        .find((s) => s.id === activeSection)
    : null;

  // Calculamos a URL do iframe com o parâmetro de isolamento se houver seção ativa
  const previewUrl = activePageData?.path
    ? `${activePageData.path}${activeSection ? `?only=${activeSection}` : ""}`
    : "";

  const handleApplyHero = useCallback(() => {
    setLastAppliedHero(heroSettings);
    // Forçar atualização do preview
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_HERO_BG", ...heroSettings },
        "*",
      );
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_HERO_CONTENT", ...heroSettings },
        "*",
      );
    }
    toast({
      title: "Preview atualizado!",
      description: "As mudanças do Hero foram aplicadas ao rascunho.",
    });
  }, [heroSettings, toast]);

  const handleApplyTypography = useCallback(() => {
    setLastAppliedFont(fontSettings);
    // Forçar atualização do preview
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_FONTS", ...fontSettings },
        "*",
      );
    }
    toast({
      title: "Preview atualizado!",
      description: "As mudanças de tipografia foram aplicadas ao rascunho.",
    });
  }, [fontSettings, toast]);

  const handleApplyServices = useCallback(() => {
    setLastAppliedServices(servicesSettings);
    // Forçar atualização do preview
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_SERVICES_CONTENT", settings: servicesSettings },
        "*",
      );
    }
    toast({
      title: "Preview atualizado!",
      description: "As mudanças dos serviços foram aplicadas ao rascunho.",
    });
  }, [servicesSettings, toast]);

  const handleApplyValues = useCallback(() => {
    setLastAppliedValues(valuesSettings);
    // Forçar atualização do preview
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_VALUES_CONTENT", settings: valuesSettings },
        "*",
      );
    }
    toast({
      title: "Preview atualizado!",
      description: "As mudanças dos valores foram aplicadas ao rascunho.",
    });
  }, [valuesSettings, toast]);

  const handleApplyGallery = useCallback(() => {
    setLastAppliedGallery(gallerySettings);
    // Forçar atualização do preview
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_GALLERY_SETTINGS", settings: gallerySettings },
        "*",
      );
    }
    toast({
      title: "Preview atualizado!",
      description: "As mudanças da galeria foram aplicadas ao rascunho.",
    });
  }, [gallerySettings, toast]);

  const handleApplyCTA = useCallback(() => {
    setLastAppliedCTA(ctaSettings);
    // Forçar atualização do preview
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_CTA_SETTINGS", settings: ctaSettings },
        "*",
      );
    }
    toast({
      title: "Preview atualizado!",
      description: "As mudanças da chamada foram aplicadas ao rascunho.",
    });
  }, [ctaSettings, toast]);

  const handleSaveGlobal = () => {
    // 1. Salva no localStorage (Produção)
    saveHeroSettings(lastAppliedHero);
    saveFontSettings(lastAppliedFont);
    saveServicesSettings(lastAppliedServices);
    saveValuesSettings(lastAppliedValues);
    saveGallerySettings(lastAppliedGallery);
    saveCTASettings(lastAppliedCTA);
    savePageVisibility(pageVisibility);
    saveVisibleSections(visibleSections);

    // 2. Atualiza estados de controle
    setLastSavedHero(lastAppliedHero);
    setLastSavedFont(lastAppliedFont);
    setLastSavedServices(lastAppliedServices);
    setLastSavedValues(lastAppliedValues);
    setLastSavedGallery(lastAppliedGallery);
    setLastSavedCTA(lastAppliedCTA);
    setLastSavedPageVisibility(pageVisibility);
    setLastSavedVisibleSections(visibleSections);

    setLastAppliedHero(lastAppliedHero);
    setLastAppliedFont(lastAppliedFont);
    setLastAppliedServices(lastAppliedServices);
    setLastAppliedValues(lastAppliedValues);
    setLastAppliedGallery(lastAppliedGallery);
    setLastAppliedCTA(lastAppliedCTA);

    toast({
      title: "Site Publicado!",
      description: "Todas as alterações foram salvas permanentemente.",
    });
  };

  // HeaderControls movido para fora do componente principal ou memorizado para evitar remounts
  const headerControls = (
    <div className="flex items-center bg-muted/50 rounded-full p-1 gap-1 ml-2 shrink-0">
      <div className="flex items-center gap-0.5 mr-1 lg:mr-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full w-7 h-7 lg:w-8 lg:h-8"
          onClick={() => {
            const currentScale =
              previewMode === "mobile" ? mobileScale : desktopScale;
            setManualScale(Math.max(0.1, currentScale - 0.1));
            setIsAutoZoom(false);
          }}
          title="Diminuir Zoom"
        >
          <ZoomOut className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        </Button>
        <span className="text-[10px] lg:text-xs font-bold min-w-10 text-center">
          {Math.round(
            (previewMode === "mobile" ? mobileScale : desktopScale) * 100,
          )}
          %
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full w-7 h-7 lg:w-8 lg:h-8"
          onClick={() => {
            const currentScale =
              previewMode === "mobile" ? mobileScale : desktopScale;
            setManualScale(Math.min(2, currentScale + 0.1));
            setIsAutoZoom(false);
          }}
          title="Aumentar Zoom"
        >
          <ZoomIn className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        </Button>
        <Button
          type="button"
          variant={isAutoZoom ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "rounded-full w-7 h-7 lg:w-8 lg:h-8",
            isAutoZoom && "bg-background shadow-sm",
          )}
          onClick={() => setIsAutoZoom(true)}
          title="Ajustar à Tela (Auto)"
        >
          <Maximize className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        </Button>
      </div>

      <div className="w-px h-4 bg-border mx-1" />

      <div className="flex items-center gap-1 px-1">
        <Button
          type="button"
          variant={previewMode === "desktop" ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "rounded-full w-7 h-7 lg:w-8 lg:h-8",
            previewMode === "desktop" && "bg-background shadow-sm",
          )}
          onClick={() => {
            setPreviewMode("desktop");
            setManualWidth(null);
          }}
          title="Visualização Desktop"
        >
          <Monitor className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        </Button>
        <Button
          type="button"
          variant={previewMode === "mobile" ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "rounded-full w-7 h-7 lg:w-8 lg:h-8",
            previewMode === "mobile" && "bg-background shadow-sm",
          )}
          onClick={() => {
            setPreviewMode("mobile");
            setManualWidth(null);
          }}
          title="Visualização Mobile"
        >
          <Smartphone className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        </Button>
      </div>

      <div className="w-px h-4 bg-border mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full w-7 h-7 lg:w-8 lg:h-8"
        onClick={reloadPreview}
        title="Recarregar Preview"
      >
        <RotateCcw className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
      </Button>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      {headerPortalTarget && createPortal(headerControls, headerPortalTarget)}
      {/* Mobile: Sidebar (Sheet) */}
      <Sheet open={isMobile && isSidebarOpen} onOpenChange={onToggleSidebar}>
        <SheetContent side="left" className="p-0 w-[85%] sm:w-80 lg:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Personalização</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <SidebarContent
              activeSection={activeSection}
              activeSectionData={activeSectionData || null}
              setActiveSection={setActiveSection}
              resetSettings={resetSettings}
              fontSettings={fontSettings}
              heroSettings={heroSettings}
              servicesSettings={servicesSettings}
              valuesSettings={valuesSettings}
              gallerySettings={gallerySettings}
              ctaSettings={ctaSettings}
              onUpdateFont={handleUpdateFont}
              onUpdateHero={handleUpdateHero}
              onUpdateServices={handleUpdateServices}
              onUpdateValues={handleUpdateValues}
              onUpdateGallery={handleUpdateGallery}
              onUpdateCTA={handleUpdateCTA}
              onSaveFont={handleApplyTypography}
              onSaveHero={handleApplyHero}
              onSaveServices={handleApplyServices}
              onSaveValues={handleApplyValues}
              onSaveGallery={handleApplyGallery}
              onSaveCTA={handleApplyCTA}
              hasFontChanges={hasFontChanges}
              hasHeroChanges={hasHeroChanges}
              hasServicesChanges={hasServicesChanges}
              hasValuesChanges={hasValuesChanges}
              hasGalleryChanges={hasGalleryChanges}
              hasCTAChanges={hasCTAChanges}
              onHighlight={handleHighlight}
              activePage={activePage}
              expandedPages={expandedPages}
              visibleSections={visibleSections}
              onPageToggle={togglePageExpansion}
              onSectionSelect={scrollToSection}
              onSectionVisibilityToggle={toggleSection}
              onSectionReset={handleSectionReset}
              pageVisibility={pageVisibility}
              onPageVisibilityChange={handlePageVisibilityChange}
              onSaveGlobal={handleSaveGlobal}
              hasUnsavedGlobalChanges={hasUnsavedGlobalChanges}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop: Sidebar Colapsável (Editor Panel) */}
      <div
        className={cn(
          "hidden lg:flex flex-col h-full border-r border-border bg-card transition-all duration-300 ease-in-out overflow-hidden shrink-0 z-20",
          isSidebarOpen ? "w-64 xl:w-80 2xl:w-96" : "w-0 border-r-0",
        )}
      >
        <div className="flex flex-col h-full w-64 xl:w-80 2xl:w-96">
          <SidebarContent
            activeSection={activeSection}
            activeSectionData={activeSectionData || null}
            setActiveSection={setActiveSection}
            resetSettings={resetSettings}
            fontSettings={fontSettings}
            heroSettings={heroSettings}
            servicesSettings={servicesSettings}
            valuesSettings={valuesSettings}
            gallerySettings={gallerySettings}
            ctaSettings={ctaSettings}
            onUpdateFont={handleUpdateFont}
            onUpdateHero={handleUpdateHero}
            onUpdateServices={handleUpdateServices}
            onUpdateValues={handleUpdateValues}
            onUpdateGallery={handleUpdateGallery}
            onUpdateCTA={handleUpdateCTA}
            onSaveFont={handleApplyTypography}
            onSaveHero={handleApplyHero}
            onSaveServices={handleApplyServices}
            onSaveValues={handleApplyValues}
            onSaveGallery={handleApplyGallery}
            onSaveCTA={handleApplyCTA}
            hasFontChanges={hasFontChanges}
            hasHeroChanges={hasHeroChanges}
            hasServicesChanges={hasServicesChanges}
            hasValuesChanges={hasValuesChanges}
            hasGalleryChanges={hasGalleryChanges}
            hasCTAChanges={hasCTAChanges}
            onHighlight={handleHighlight}
            activePage={activePage}
            expandedPages={expandedPages}
            visibleSections={visibleSections}
            onPageToggle={togglePageExpansion}
            onSectionSelect={scrollToSection}
            onSectionVisibilityToggle={toggleSection}
            onSectionReset={handleSectionReset}
            pageVisibility={pageVisibility}
            onPageVisibilityChange={handlePageVisibilityChange}
            onSaveGlobal={handleSaveGlobal}
            hasUnsavedGlobalChanges={hasUnsavedGlobalChanges}
          />
        </div>
      </div>

      {/* Preview do Site (Ocupa o restante à direita) */}
      <div className="flex-1 w-full h-full flex flex-col min-w-0 transition-all duration-300 relative z-0">
        <div className="flex items-center justify-between mb-2 lg:hidden px-4 pt-4">
          <h2 className="font-serif text-base font-bold text-primary">
            Preview do Site
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setPreviewMode(
                  previewMode === "desktop" ? "mobile" : "desktop",
                );
                setManualWidth(null);
              }}
              className="h-8 w-8"
            >
              {previewMode === "desktop" ? (
                <Smartphone className="w-4 h-4" />
              ) : (
                <Monitor className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex-1 flex flex-col h-full min-w-0 bg-muted/5 overflow-hidden">
          <div className="bg-card border-b border-border px-3 lg:px-6 py-2 lg:py-3 flex flex-row items-center justify-between space-y-0 shrink-0 h-12 lg:h-16 shadow-sm z-10">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="h-6 lg:h-8 px-2 lg:px-4 rounded-full bg-muted/50 flex items-center gap-1.5 lg:gap-2 text-[8px] lg:text-[10px] font-bold tracking-widest text-muted-foreground min-w-25 lg:min-w-40 uppercase">
                <Layout className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                <span className="truncate">{activePageData?.path}</span>
              </div>
            </div>
          </div>

          <div
            ref={containerRef}
            className="flex-1 bg-muted/10 relative flex items-center justify-center overflow-hidden p-2 lg:p-4 group min-w-0"
          >
            {/* Setas de Ajuste Manual */}
            <div className="absolute inset-y-0 left-2 lg:left-4 flex items-center pointer-events-none z-20">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full shadow-lg pointer-events-auto bg-[#FFD6D6] hover:bg-[#FFC1C1] text-black border-none transition-all hover:scale-110 active:scale-95"
                onClick={() =>
                  setManualWidth(
                    (prev) =>
                      (prev || (previewMode === "mobile" ? 375 : 1280)) - 50,
                  )
                }
                title="Diminuir Largura"
              >
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
              </Button>
            </div>

            <div className="absolute inset-y-0 right-2 lg:right-4 flex items-center pointer-events-none z-20">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full shadow-lg pointer-events-auto bg-[#FFD6D6] hover:bg-[#FFC1C1] text-black border-none transition-all hover:scale-110 active:scale-95"
                onClick={() =>
                  setManualWidth(
                    (prev) =>
                      (prev || (previewMode === "mobile" ? 375 : 1280)) + 50,
                  )
                }
                title="Aumentar Largura"
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </Button>
            </div>

            {/* Monitor / Browser Wrapper */}
            <div
              style={{
                width:
                  previewMode === "desktop" && isAutoZoom
                    ? "100%"
                    : currentWidth *
                      (previewMode === "mobile" ? mobileScale : desktopScale),
                height:
                  previewMode === "desktop" && isAutoZoom
                    ? "100%"
                    : (previewMode === "mobile" ? 750 : 850) *
                      (previewMode === "mobile" ? mobileScale : desktopScale),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                className={cn(
                  "transition-all duration-500 ease-in-out shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden bg-white flex flex-col shrink-0 will-change-transform",
                  previewMode === "desktop"
                    ? "rounded-xl border border-border"
                    : "rounded-[3rem] border-12 border-black",
                )}
                style={{
                  width: `${currentWidth}px`,
                  height:
                    previewMode === "desktop" && isAutoZoom
                      ? "100%"
                      : previewMode === "mobile"
                        ? "750px"
                        : "850px",
                  transform:
                    previewMode === "desktop" && isAutoZoom
                      ? "none"
                      : `scale(${previewMode === "mobile" ? mobileScale : desktopScale})`,
                  transformOrigin: "center center",
                }}
              >
                {/* Browser Header (Desktop Only) */}
                {previewMode === "desktop" && (
                  <div className="h-10 bg-[#F1F3F4] border-b border-border flex items-center px-4 gap-4 shrink-0">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                      <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                    </div>
                    <div className="flex-1 max-w-md bg-white h-6 rounded-md border border-border flex items-center px-3 gap-2 overflow-hidden">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/20 shrink-0" />
                      <span className="text-[10px] text-muted-foreground truncate">
                        {window.location.origin}
                        {activePageData?.path}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex-1 w-full overflow-hidden bg-white relative">
                  <iframe
                    ref={iframeRef}
                    key={`${activePage}-${previewKey}`}
                    src={previewUrl}
                    className="absolute inset-0 w-full h-full border-none overflow-hidden"
                    title="Preview"
                    onLoad={() => {
                      // Re-enviar o estado atual quando o iframe carregar
                      if (iframeRef.current?.contentWindow) {
                        const win = iframeRef.current.contentWindow;
                        // Hero
                        win.postMessage(
                          { type: "UPDATE_HERO_BG", ...heroSettings },
                          "*",
                        );
                        win.postMessage(
                          { type: "UPDATE_HERO_CONTENT", ...heroSettings },
                          "*",
                        );
                        // Serviços
                        win.postMessage(
                          {
                            type: "UPDATE_SERVICES_CONTENT",
                            settings: servicesSettings,
                          },
                          "*",
                        );
                        // Valores
                        win.postMessage(
                          {
                            type: "UPDATE_VALUES_CONTENT",
                            settings: valuesSettings,
                          },
                          "*",
                        );
                        // Fontes
                        win.postMessage(
                          { type: "UPDATE_FONTS", ...fontSettings },
                          "*",
                        );
                        // Galeria
                        win.postMessage(
                          {
                            type: "UPDATE_GALLERY_SETTINGS",
                            settings: gallerySettings,
                          },
                          "*",
                        );
                        // CTA
                        win.postMessage(
                          {
                            type: "UPDATE_CTA_SETTINGS",
                            settings: ctaSettings,
                          },
                          "*",
                        );
                      }
                    }}
                  />
                </div>

                {/* Mobile Home Indicator */}
                {previewMode === "mobile" && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SectionData {
  id: string;
  name: string;
  description: string;
}

interface SidebarContentProps {
  activeSection: string | null;
  activeSectionData: SectionData | null;
  setActiveSection: (id: string | null) => void;
  resetSettings: () => void;
  fontSettings: FontSettings;
  heroSettings: HeroSettings;
  servicesSettings: ServicesSettings;
  valuesSettings: ValuesSettings;
  gallerySettings: GallerySettings;
  ctaSettings: CTASettings;
  onUpdateFont: (updates: Partial<FontSettings>) => void;
  onUpdateHero: (updates: Partial<HeroSettings>) => void;
  onUpdateServices: (updates: Partial<ServicesSettings>) => void;
  onUpdateValues: (updates: Partial<ValuesSettings>) => void;
  onUpdateGallery: (updates: Partial<GallerySettings>) => void;
  onUpdateCTA: (updates: Partial<CTASettings>) => void;
  onSaveFont: () => void;
  onSaveHero: () => void;
  onSaveServices: () => void;
  onSaveValues: () => void;
  onSaveGallery: () => void;
  onSaveCTA: () => void;
  hasFontChanges: boolean;
  hasHeroChanges: boolean;
  hasServicesChanges: boolean;
  hasValuesChanges: boolean;
  hasGalleryChanges: boolean;
  hasCTAChanges: boolean;
  onHighlight: (id: string) => void;
  activePage: string;
  expandedPages: string[];
  visibleSections: Record<string, boolean>;
  onPageToggle: (id: string) => void;
  onSectionSelect: (id: string) => void;
  onSectionVisibilityToggle: (id: string) => void;
  onSectionReset: (id: string) => void;
  pageVisibility: Record<string, boolean>;
  onPageVisibilityChange: (id: string, visible: boolean) => void;
  onSaveGlobal: () => void;
  hasUnsavedGlobalChanges: boolean;
}

const SidebarContent = memo(
  ({
    activeSection,
    activeSectionData,
    setActiveSection,
    resetSettings,
    fontSettings,
    heroSettings,
    servicesSettings,
    valuesSettings,
    gallerySettings,
    ctaSettings,
    onUpdateFont,
    onUpdateHero,
    onUpdateServices,
    onUpdateValues,
    onUpdateGallery,
    onUpdateCTA,
    onSaveFont,
    onSaveHero,
    onSaveServices,
    onSaveValues,
    onSaveGallery,
    onSaveCTA,
    hasFontChanges,
    hasHeroChanges,
    hasServicesChanges,
    hasValuesChanges,
    hasGalleryChanges,
    hasCTAChanges,
    onHighlight,
    activePage,
    expandedPages,
    visibleSections,
    onPageToggle,
    onSectionSelect,
    onSectionVisibilityToggle,
    onSectionReset,
    pageVisibility,
    onPageVisibilityChange,
    onSaveGlobal,
    hasUnsavedGlobalChanges,
  }: SidebarContentProps) => {
    return (
      <div className="flex flex-col h-full text-[clamp(0.75rem,1vw,0.875rem)]">
        <div className="p-3 xl:p-6 pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-primary font-bold">
              <Settings2 className="w-4 h-4 xl:w-5 xl:h-5" />
              <span className="text-[10px] xl:text-sm tracking-wide uppercase">
                Editor
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetSettings}
              className="h-7 xl:h-8 px-2 xl:px-3 gap-1 xl:gap-1.5 text-[9px] xl:text-xs text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
            >
              <RotateCcw className="w-2.5 h-2.5 xl:w-3 xl:h-3" />
              <span>Resetar</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 xl:p-6 custom-scrollbar min-w-0">
          {activeSection ? (
            /* Editor de Seção (Placeholder) */
            <div className="space-y-4 xl:space-y-6">
              <div className="flex items-center gap-2 mb-3 xl:mb-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveSection(null)}
                  className="h-7 w-7 xl:h-8 xl:w-8 rounded-full p-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                </Button>
                <div>
                  <h3 className="text-xs xl:text-sm font-bold text-primary truncate max-w-37.5 xl:max-w-none">
                    {activeSectionData?.name}
                  </h3>
                  <p className="text-[9px] xl:text-[10px] text-muted-foreground">
                    Editando seção
                  </p>
                </div>
              </div>

              <div className="space-y-3 xl:space-y-4 p-3 xl:p-4 rounded-xl bg-muted/30 border border-border">
                {/* --- LAYOUT GLOBAL --- */}
                {activeSection === "typography" && (
                  <TypographyEditor
                    settings={fontSettings}
                    onUpdate={onUpdateFont}
                    onHighlight={onHighlight}
                    hasChanges={hasFontChanges}
                    onSave={onSaveFont}
                  />
                )}

                {/* --- PÁGINA: INÍCIO (HOME) --- */}
                {activeSection === "hero" && (
                  <HeroEditor
                    settings={heroSettings}
                    onUpdate={onUpdateHero}
                    onHighlight={onHighlight}
                    hasChanges={hasHeroChanges}
                    onSave={onSaveHero}
                  />
                )}
                {activeSection === "story" && (
                  <HistoryEditor hasChanges={false} onSave={() => {}} />
                )}
                {activeSection === "services" && (
                  <ServicesEditor
                    settings={servicesSettings}
                    onUpdate={onUpdateServices}
                    hasChanges={hasServicesChanges}
                    onSave={onSaveServices}
                  />
                )}
                {activeSection === "values" && (
                  <ValuesEditor
                    settings={valuesSettings}
                    onUpdate={onUpdateValues}
                    onSave={onSaveValues}
                    hasChanges={hasValuesChanges}
                  />
                )}

                {activeSection === "gallery-preview" && (
                  <GalleryEditor
                    settings={gallerySettings}
                    onUpdate={onUpdateGallery}
                    onSave={onSaveGallery}
                    hasChanges={hasGalleryChanges}
                  />
                )}

                {activeSection === "cta" && (
                  <CTAEditor
                    settings={ctaSettings}
                    onUpdate={onUpdateCTA}
                    onSave={onSaveCTA}
                    hasChanges={hasCTAChanges}
                  />
                )}

                {/* --- FALLBACK PARA SEÇÕES EM DESENVOLVIMENTO --- */}
                {![
                  "typography",
                  "hero",
                  "story",
                  "services",
                  "values",
                  "gallery-preview",
                  "cta",
                ].includes(activeSection) && (
                  <div className="py-12 text-center">
                    <Settings2 className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      O editor para esta seção será implementado em breve.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <SidebarNav
              pages={pages}
              sections={sections}
              activePage={activePage}
              activeSection={activeSection}
              expandedPages={expandedPages}
              visibleSections={visibleSections}
              onPageToggle={onPageToggle}
              onSectionSelect={onSectionSelect}
              onSectionVisibilityToggle={onSectionVisibilityToggle}
              onSectionReset={onSectionReset}
              pageVisibility={pageVisibility}
              onPageVisibilityChange={onPageVisibilityChange}
            />
          )}
        </div>

        <div className="p-6 pt-4 border-t border-border bg-background">
          <Button
            type="button"
            disabled={
              !hasUnsavedGlobalChanges &&
              !hasHeroChanges &&
              !hasFontChanges &&
              !hasServicesChanges &&
              !hasValuesChanges &&
              !hasGalleryChanges &&
              !hasCTAChanges
            }
            onClick={onSaveGlobal}
            className={cn(
              "w-full font-bold py-6 rounded-xl transition-all duration-300",
              hasUnsavedGlobalChanges ||
                hasHeroChanges ||
                hasFontChanges ||
                hasServicesChanges ||
                hasValuesChanges ||
                hasGalleryChanges ||
                hasCTAChanges
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            {hasUnsavedGlobalChanges ||
            hasHeroChanges ||
            hasFontChanges ||
            hasServicesChanges ||
            hasValuesChanges ||
            hasGalleryChanges ||
            hasCTAChanges
              ? "Publicar Site"
              : "Tudo Atualizado"}
          </Button>
        </div>
      </div>
    );
  },
);
