/**
 * Hook para gerenciar o estado global das configurações do site.
 * Lida com a persistência no localStorage, sincronização com o iframe
 * e controle de alterações (dirty states) para cada seção.
 */

import { type RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  type CTASettings,
  defaultCTASettings,
  defaultFontSettings,
  defaultFooterSettings,
  defaultGallerySettings,
  defaultHeaderSettings,
  defaultHeroSettings,
  defaultServicesSettings,
  defaultValuesSettings,
  type FontSettings,
  type FooterSettings,
  type GallerySettings,
  getCTASettings,
  getFontSettings,
  getFooterSettings,
  getGallerySettings,
  getHeaderSettings,
  getHeroSettings,
  getPageVisibility,
  getServicesSettings,
  getValuesSettings,
  getVisibleSections,
  type HeaderSettings,
  type HeroSettings,
  type ServicesSettings,
  saveCTASettings,
  saveFontSettings,
  saveFooterSettings,
  saveGallerySettings,
  saveHeaderSettings,
  saveHeroSettings,
  savePageVisibility,
  saveServicesSettings,
  saveValuesSettings,
  saveVisibleSections,
  type ValuesSettings,
} from "@/lib/booking-data";

export function useSiteEditor(iframeRef: RefObject<HTMLIFrameElement | null>) {
  const { toast } = useToast();

  // Estados de customização (inicializados do storage)
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(defaultHeroSettings);
  const [fontSettings, setFontSettings] = useState<FontSettings>(defaultFontSettings);
  const [servicesSettings, setServicesSettings] = useState<ServicesSettings>(defaultServicesSettings);
  const [valuesSettings, setValuesSettings] = useState<ValuesSettings>(defaultValuesSettings);
  const [gallerySettings, setGallerySettings] = useState<GallerySettings>(defaultGallerySettings);
  const [ctaSettings, setCTASettings] = useState<CTASettings>(defaultCTASettings);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(defaultHeaderSettings);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings);

  // Estados de visibilidade
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({});
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});

  // Estados para controle de botões (Aplicar vs Salvar)
  const [lastAppliedHero, setLastAppliedHero] = useState<HeroSettings>(defaultHeroSettings);
  const [lastAppliedFont, setLastAppliedFont] = useState<FontSettings>(defaultFontSettings);
  const [lastAppliedServices, setLastAppliedServices] = useState<ServicesSettings>(defaultServicesSettings);
  const [lastAppliedValues, setLastAppliedValues] = useState<ValuesSettings>(defaultValuesSettings);
  const [lastAppliedGallery, setLastAppliedGallery] = useState<GallerySettings>(defaultGallerySettings);
  const [lastAppliedCTA, setLastAppliedCTA] = useState<CTASettings>(defaultCTASettings);
  const [lastAppliedHeader, setLastAppliedHeader] = useState<HeaderSettings>(defaultHeaderSettings);
  const [lastAppliedFooter, setLastAppliedFooter] = useState<FooterSettings>(defaultFooterSettings);

  const [lastSavedHero, setLastSavedHero] = useState<HeroSettings>(defaultHeroSettings);
  const [lastSavedFont, setLastSavedFont] = useState<FontSettings>(defaultFontSettings);
  const [lastSavedServices, setLastSavedServices] = useState<ServicesSettings>(defaultServicesSettings);
  const [lastSavedValues, setLastSavedValues] = useState<ValuesSettings>(defaultValuesSettings);
  const [lastSavedGallery, setLastSavedGallery] = useState<GallerySettings>(defaultGallerySettings);
  const [lastSavedCTA, setLastSavedCTA] = useState<CTASettings>(defaultCTASettings);
  const [lastSavedHeader, setLastSavedHeader] = useState<HeaderSettings>(defaultHeaderSettings);
  const [lastSavedFooter, setLastSavedFooter] = useState<FooterSettings>(defaultFooterSettings);

  const [lastSavedPageVisibility, setLastSavedPageVisibility] = useState<Record<string, boolean>>({});
  const [lastSavedVisibleSections, setLastSavedVisibleSections] = useState<Record<string, boolean>>({});

  // Carregamento inicial
  useEffect(() => {
    const loadedHero = getHeroSettings();
    const loadedFont = getFontSettings();
    const loadedServices = getServicesSettings();
    const loadedValues = getValuesSettings();
    const loadedGallery = getGallerySettings();
    const loadedCTA = getCTASettings();
    const loadedHeader = getHeaderSettings();
    const loadedFooter = getFooterSettings();
    const loadedPageVisibility = getPageVisibility();
    const loadedVisibleSections = getVisibleSections();

    setHeroSettings(loadedHero);
    setFontSettings(loadedFont);
    setServicesSettings(loadedServices);
    setValuesSettings(loadedValues);
    setGallerySettings(loadedGallery);
    setCTASettings(loadedCTA);
    setHeaderSettings(loadedHeader);
    setFooterSettings(loadedFooter);
    setPageVisibility(loadedPageVisibility);
    setVisibleSections(loadedVisibleSections);

    setLastAppliedHero(loadedHero);
    setLastAppliedFont(loadedFont);
    setLastAppliedServices(loadedServices);
    setLastAppliedValues(loadedValues);
    setLastAppliedGallery(loadedGallery);
    setLastAppliedCTA(loadedCTA);
    setLastAppliedHeader(loadedHeader);
    setLastAppliedFooter(loadedFooter);

    setLastSavedHero(loadedHero);
    setLastSavedFont(loadedFont);
    setLastSavedServices(loadedServices);
    setLastSavedValues(loadedValues);
    setLastSavedGallery(loadedGallery);
    setLastSavedCTA(loadedCTA);
    setLastSavedHeader(loadedHeader);
    setLastSavedFooter(loadedFooter);
    setLastSavedPageVisibility(loadedPageVisibility);
    setLastSavedVisibleSections(loadedVisibleSections);
  }, []);

  // Handlers de atualização
  const handleUpdateHero = useCallback((updates: Partial<HeroSettings>) => {
    setHeroSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateFont = useCallback((updates: Partial<FontSettings>) => {
    setFontSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateServices = useCallback((updates: Partial<ServicesSettings>) => {
    setServicesSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateValues = useCallback((updates: Partial<ValuesSettings>) => {
    setValuesSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateGallery = useCallback((updates: Partial<GallerySettings>) => {
    setGallerySettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateCTA = useCallback((updates: Partial<CTASettings>) => {
    setCTASettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateHeader = useCallback((updates: Partial<HeaderSettings>) => {
    setHeaderSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateFooter = useCallback((updates: Partial<FooterSettings>) => {
    setFooterSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handlePageVisibilityChange = useCallback((pageId: string, isVisible: boolean) => {
    setPageVisibility((prev) => ({ ...prev, [pageId]: isVisible }));
  }, []);

  const handleSectionVisibilityToggle = useCallback((sectionId: string) => {
    setVisibleSections((prev) => ({
      ...prev,
      
      [sectionId]: prev[sectionId] === false ? true : false,
    }));
  }, []);

  // Notificamos o iframe sobre a mudança de visibilidade das páginas
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_PAGE_VISIBILITY",
          visibility: pageVisibility,
        },
        "*"
      );
    }
  }, [pageVisibility, iframeRef]);

  // Sincronização com o iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "UPDATE_HERO_BG", ...heroSettings }, "*");
      iframeRef.current.contentWindow.postMessage({ type: "UPDATE_HERO_CONTENT", ...heroSettings }, "*");
    }
  }, [heroSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "UPDATE_SERVICES_CONTENT", settings: servicesSettings }, "*");
    }
  }, [servicesSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "UPDATE_VALUES_CONTENT", settings: valuesSettings }, "*");
    }
  }, [valuesSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "UPDATE_FONTS", ...fontSettings }, "*");
    }
  }, [fontSettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "UPDATE_GALLERY_SETTINGS", settings: gallerySettings }, "*");
    }
  }, [gallerySettings, iframeRef]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "UPDATE_CTA_SETTINGS", settings: ctaSettings }, "*");
    }
  }, [ctaSettings, iframeRef]);

  // Aplicar mudanças (atualizar estados applied e notificar iframe)
  const handleApplyHero = useCallback(() => {
    setLastAppliedHero({ ...heroSettings });
    toast({ title: "Preview atualizado!", description: "As mudanças do banner foram aplicadas ao rascunho." });
  }, [heroSettings, toast]);

  const handleApplyTypography = useCallback(() => {
    setLastAppliedFont({ ...fontSettings });
    toast({ title: "Preview atualizado!", description: "As mudanças de tipografia foram aplicadas ao rascunho." });
  }, [fontSettings, toast]);

  const handleApplyServices = useCallback(() => {
    setLastAppliedServices({ ...servicesSettings });
    toast({ title: "Preview atualizado!", description: "As mudanças de serviços foram aplicadas ao rascunho." });
  }, [servicesSettings, toast]);

  const handleApplyValues = useCallback(() => {
    setLastAppliedValues({ ...valuesSettings });
    toast({ title: "Preview atualizado!", description: "As mudanças de valores foram aplicadas ao rascunho." });
  }, [valuesSettings, toast]);

  const handleApplyGallery = useCallback(() => {
    setLastAppliedGallery({ ...gallerySettings });
    toast({ title: "Preview atualizado!", description: "As mudanças da galeria foram aplicadas ao rascunho." });
  }, [gallerySettings, toast]);

  const handleApplyCTA = useCallback(() => {
    setLastAppliedCTA({ ...ctaSettings });
    toast({ title: "Preview atualizado!", description: "As mudanças da chamada foram aplicadas ao rascunho." });
  }, [ctaSettings, toast]);

  const handleApplyHeader = useCallback(() => {
    setLastAppliedHeader({ ...headerSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "UPDATE_HEADER_SETTINGS", settings: { ...headerSettings } }, "*");
    }
    toast({ title: "Preview atualizado!", description: "As mudanças do cabeçalho foram aplicadas ao rascunho." });
  }, [headerSettings, toast, iframeRef]);

  const handleApplyFooter = useCallback(() => {
    setLastAppliedFooter({ ...footerSettings });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "UPDATE_FOOTER_SETTINGS", settings: { ...footerSettings } }, "*");
    }
    toast({ title: "Preview atualizado!", description: "As mudanças do rodapé foram aplicadas ao rascunho." });
  }, [footerSettings, toast, iframeRef]);

  const handleSaveGlobal = useCallback(() => {
    saveHeroSettings(heroSettings);
    saveFontSettings(fontSettings);
    saveServicesSettings(servicesSettings);
    saveValuesSettings(valuesSettings);
    saveGallerySettings(gallerySettings);
    saveCTASettings(ctaSettings);
    saveHeaderSettings(headerSettings);
    saveFooterSettings(footerSettings);
    savePageVisibility(pageVisibility);
    saveVisibleSections(visibleSections);

    setLastSavedHero(heroSettings);
    setLastSavedFont(fontSettings);
    setLastSavedServices(servicesSettings);
    setLastSavedValues(valuesSettings);
    setLastSavedGallery(gallerySettings);
    setLastSavedCTA(ctaSettings);
    setLastSavedHeader(headerSettings);
    setLastSavedFooter(footerSettings);
    setLastSavedPageVisibility(pageVisibility);
    setLastSavedVisibleSections(visibleSections);

    setLastAppliedHero(heroSettings);
    setLastAppliedFont(fontSettings);
    setLastAppliedServices(servicesSettings);
    setLastAppliedValues(valuesSettings);
    setLastAppliedGallery(gallerySettings);
    setLastAppliedCTA(ctaSettings);
    setLastAppliedHeader(headerSettings);
    setLastAppliedFooter(footerSettings);

    toast({ title: "Site Publicado!", description: "Todas as alterações foram salvas permanentemente." });
  }, [heroSettings, fontSettings, servicesSettings, valuesSettings, gallerySettings, ctaSettings, headerSettings, footerSettings, pageVisibility, visibleSections, toast]);

  const resetSettings = useCallback(() => {
    if (confirm("Tem certeza que deseja resetar todas as configurações para o padrão original?")) {
      setHeroSettings(defaultHeroSettings);
      setFontSettings(defaultFontSettings);
      setServicesSettings(defaultServicesSettings);
      setValuesSettings(defaultValuesSettings);
      setGallerySettings(defaultGallerySettings);
      setCTASettings(defaultCTASettings);
      setHeaderSettings(defaultHeaderSettings);
      setFooterSettings(defaultFooterSettings);
    }
  }, []);

  const handleSectionReset = useCallback((sectionId: string) => {
    if (confirm(`Deseja resetar as configurações da seção "${sectionId}" para o padrão?`)) {
      switch (sectionId) {
        case "header": setHeaderSettings(defaultHeaderSettings); break;
        case "footer": setFooterSettings(defaultFooterSettings); break;
        case "hero": setHeroSettings(defaultHeroSettings); break;
        case "typography": setFontSettings(defaultFontSettings); break;
        case "services": setServicesSettings(defaultServicesSettings); break;
        case "values": setValuesSettings(defaultValuesSettings); break;
        case "gallery-preview":
        case "gallery-grid": setGallerySettings(defaultGallerySettings); break;
        case "cta": setCTASettings(defaultCTASettings); break;
        default:
          toast({ title: "Aviso", description: "Esta seção não possui configurações customizáveis para resetar." });
          break;
      }
    }
  }, [toast]);

  // Booleans para habilitar/desabilitar botões
  const hasHeroChanges = JSON.stringify(heroSettings) !== JSON.stringify(lastAppliedHero);
  const hasFontChanges = JSON.stringify(fontSettings) !== JSON.stringify(lastAppliedFont);
  const hasServicesChanges = JSON.stringify(servicesSettings) !== JSON.stringify(lastAppliedServices);
  const hasValuesChanges = JSON.stringify(valuesSettings) !== JSON.stringify(lastAppliedValues);
  const hasGalleryChanges = JSON.stringify(gallerySettings) !== JSON.stringify(lastAppliedGallery);
  const hasCTAChanges = JSON.stringify(ctaSettings) !== JSON.stringify(lastAppliedCTA);
  const hasHeaderChanges = JSON.stringify(headerSettings) !== JSON.stringify(lastAppliedHeader);
  const hasFooterChanges = JSON.stringify(footerSettings) !== JSON.stringify(lastAppliedFooter);

  const hasUnsavedGlobalChanges = useMemo(() => {
    const heroChanged = JSON.stringify(lastAppliedHero) !== JSON.stringify(lastSavedHero);
    const fontChanged = JSON.stringify(lastAppliedFont) !== JSON.stringify(lastSavedFont);
    const servicesChanged = JSON.stringify(lastAppliedServices) !== JSON.stringify(lastSavedServices);
    const valuesChanged = JSON.stringify(lastAppliedValues) !== JSON.stringify(lastSavedValues);
    const galleryChanged = JSON.stringify(lastAppliedGallery) !== JSON.stringify(lastSavedGallery);
    const ctaChanged = JSON.stringify(lastAppliedCTA) !== JSON.stringify(lastSavedCTA);
    const headerChanged = JSON.stringify(lastAppliedHeader) !== JSON.stringify(lastSavedHeader);
    const footerChanged = JSON.stringify(lastAppliedFooter) !== JSON.stringify(lastSavedFooter);

    const pageVisibilityChanged = JSON.stringify(pageVisibility) !== JSON.stringify(lastSavedPageVisibility);
    const visibleSectionsChanged = JSON.stringify(visibleSections) !== JSON.stringify(lastSavedVisibleSections);

    return (
      heroChanged || fontChanged || servicesChanged || valuesChanged ||
      galleryChanged || ctaChanged || headerChanged || footerChanged ||
      pageVisibilityChanged || visibleSectionsChanged
    );
  }, [
    lastAppliedHero, lastSavedHero, lastAppliedFont, lastSavedFont,
    lastAppliedServices, lastSavedServices, lastAppliedValues, lastSavedValues,
    lastAppliedGallery, lastSavedGallery, lastAppliedCTA, lastSavedCTA,
    lastAppliedHeader, lastSavedHeader, lastAppliedFooter, lastSavedFooter,
    pageVisibility, lastSavedPageVisibility, visibleSections, lastSavedVisibleSections
  ]);

  return {
    heroSettings,
    fontSettings,
    servicesSettings,
    valuesSettings,
    gallerySettings,
    ctaSettings,
    headerSettings,
    footerSettings,
    pageVisibility,
    visibleSections,
    handleUpdateHero,
    handleUpdateFont,
    handleUpdateServices,
    handleUpdateValues,
    handleUpdateGallery,
    handleUpdateCTA,
    handleUpdateHeader,
    handleUpdateFooter,
    handlePageVisibilityChange,
    handleSectionVisibilityToggle,
    handleApplyHero,
    handleApplyTypography,
    handleApplyServices,
    handleApplyValues,
    handleApplyGallery,
    handleApplyCTA,
    handleApplyHeader,
    handleApplyFooter,
    handleSaveGlobal,
    resetSettings,
    handleSectionReset,
    hasHeroChanges,
    hasFontChanges,
    hasServicesChanges,
    hasValuesChanges,
    hasGalleryChanges,
    hasCTAChanges,
    hasHeaderChanges,
    hasFooterChanges,
    hasUnsavedGlobalChanges,
  };
}
