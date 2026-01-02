/**
 * useNavigationManager: Hook de Gerenciamento de Navegação do Editor
 * 
 * Este hook centraliza toda a lógica de navegação dentro do editor de site (painel administrativo).
 * Suas principais responsabilidades incluem:
 * 
 * 1. Controle de Estados de Navegação:
 *    - Mantém a trilha da página ativa (ex: 'layout', 'inicio', 'sobre').
 *    - Identifica qual seção específica está sendo editada no momento.
 *    - Gerencia quais grupos de páginas estão expandidos no menu lateral.
 * 
 * 2. Integração com o Preview (Iframe):
 *    - Gera dinamicamente a `previewUrl` com base na página ativa e na seção em edição.
 *    - Adiciona parâmetros de filtragem (como `?only=sectionId`) para permitir o isolamento visual 
 *      de seções durante a edição.
 * 
 * 3. Ações de Interação:
 *    - `togglePageExpansion`: Alterna a visibilidade de sub-itens de páginas no menu.
 *    - `scrollToSection`: Define a seção ativa, o que pode disparar comportamentos de foco no preview.
 *    - `handleHighlight`: (Em expansão) Lógica para destacar visualmente componentes no iframe.
 * 
 * Este hook é essencial para garantir que o que o administrador vê no painel lateral esteja 
 * sincronizado com o que o iframe do site está exibindo.
 */
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type PageItem, pages, type SectionItem, sections } from "../components/editor-constants";

export function useNavigationManager(iframeRef: RefObject<HTMLIFrameElement | null>) {
  const [activePage, setActivePage] = useState("layout");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedPages, setExpandedPages] = useState<string[]>(["layout", "inicio"]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPageReady, setIsPageReady] = useState(true);
  const lastIframePath = useRef<string | null>(null);

  const activePageData = pages.find((p: PageItem) => p.id === activePage);
  const activeSectionData = Object.values(sections).flat().find((s: SectionItem) => s.id === activeSection);
  
  const previewUrl = useMemo(() => {
    // Se estivermos em 'layout', usamos o último path do iframe ou a home.
    // Isso evita que o iframe fique em branco ao selecionar Layout Global.
    const path = activePage === "layout" 
      ? (lastIframePath.current || "/") 
      : (activePageData?.path || "/");
    
    const baseUrl = path === "/" ? "/?preview=true" : `${path}?preview=true`;
    
    // Adicionamos o parâmetro 'only' na URL inicial para garantir que o 
    // primeiro render já venha isolado, evitando o flash da home inteira.
    // Exceção: 'typography' e 'colors' devem mostrar a página inteira para visualização global.
    const shouldIsolate = activeSection && activeSection !== "typography" && activeSection !== "colors";
    return shouldIsolate ? `${baseUrl}&only=${activeSection}` : baseUrl;
  }, [activePage, activePageData, activeSection]);

  const togglePageExpansion = useCallback((pageId: string) => {
    setExpandedPages((prev: string[]) => 
      prev.includes(pageId) ? prev.filter((id: string) => id !== pageId) : [...prev, pageId]
    );
    
    // Ao expandir uma página, definimos como ativa
    const page = pages.find((p: PageItem) => p.id === pageId);
    if (page) {
      if (pageId !== activePage) {
        setIsPageReady(false);
      }
      setActivePage(pageId);
      // Ao mudar de página via menu, limpamos a seção ativa para evitar isolamento órfão
      setActiveSection(null);
    }
  }, [activePage]);

  const scrollToSection = useCallback((sectionId: string, pageId?: string) => {
    if (pageId && pageId !== activePage) {
      setIsPageReady(false);
      setActivePage(pageId);
      // Se mudar de página, garantimos que a nova página carregue antes de isolar
      // (o useEffect de load cuidará disso)
    }
    setActiveSection(sectionId);
  }, [activePage]);

  // Efeito para lidar com a navegação de página e carregamento do iframe
  useEffect(() => {
    if (activePage === "layout") {
      setIsNavigating(false);
    } else if (activePageData) {
      setIsNavigating(true);
    }

    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => {
        setIsPageReady(true);
        setIsNavigating(false);
        if (iframe.contentWindow) {
          // Se for tipografia, limpamos qualquer isolamento anterior para mostrar a página toda
          const sectionId = activeSection === "typography" ? null : activeSection;
          iframe.contentWindow.postMessage({
            type: "SET_ISOLATED_SECTION",
            sectionId: sectionId,
          }, "*");
        }
      };

      iframe.addEventListener("load", handleLoad);
      return () => {
        iframe.removeEventListener("load", handleLoad);
      };
    }
  }, [activePage, activePageData, iframeRef, activeSection]);

  // Sincronizar isolamento de seção com o iframe
  useEffect(() => {
    if (isPageReady && !isNavigating && iframeRef.current?.contentWindow) {
      // Se for tipografia, limpamos qualquer isolamento anterior para mostrar a página toda
      const sectionId = activeSection === "typography" ? null : activeSection;
      iframeRef.current.contentWindow.postMessage({ 
        type: "SET_ISOLATED_SECTION", 
        sectionId: sectionId 
      }, "*");
    }
  }, [activeSection, iframeRef, isNavigating, isPageReady]);

  // Escutar mensagens de navegação do iframe para sincronizar o menu lateral
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PAGE_NAVIGATED") {
        const path = event.data.path;
        lastIframePath.current = path; // Sincroniza o path atual do iframe
        
        const page = pages.find(p => p.path === path && p.id !== "layout");
        // Só muda a página ativa automaticamente se não estivermos no modo Layout Global
        if (page && page.id !== activePage && activePage !== "layout") {
          setActivePage(page.id);
          setActiveSection(null); // Limpa seção ao navegar manualmente
          if (!expandedPages.includes(page.id)) {
            setExpandedPages(prev => [...prev, page.id]);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [activePage, expandedPages]);

  const handleHighlight = useCallback(() => {
    // A lógica de destaque pode ser implementada diretamente no preview
    // ou via CSS condicional baseada no activeSection
  }, []);

  return {
    activePage,
    setActivePage,
    activeSection,
    setActiveSection,
    expandedPages,
    setExpandedPages,
    togglePageExpansion,
    scrollToSection,
    handleHighlight,
    activePageData,
    activeSectionData,
    previewUrl,
  };
}
