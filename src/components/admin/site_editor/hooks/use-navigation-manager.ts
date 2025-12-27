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
import { type RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { pages, sections, type PageItem, type SectionItem } from "../components/editor-constants";

export function useNavigationManager(iframeRef: RefObject<HTMLIFrameElement | null>) {
  const [activePage, setActivePage] = useState("layout");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedPages, setExpandedPages] = useState<string[]>(["layout", "inicio"]);

  const togglePageExpansion = useCallback((pageId: string) => {
    setExpandedPages((prev: string[]) => 
      prev.includes(pageId) ? prev.filter((id: string) => id !== pageId) : [...prev, pageId]
    );
    const page = pages.find((p: PageItem) => p.id === pageId);
    if (page) setActivePage(pageId);
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
  }, []);

  // Sincronizar isolamento de seção com o iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      if (activeSection) {
        iframeRef.current.contentWindow.postMessage({ 
          type: "SET_ISOLATED_SECTION", 
          sectionId: activeSection 
        }, "*");
      } else {
        iframeRef.current.contentWindow.postMessage({ 
          type: "SET_ISOLATED_SECTION", 
          sectionId: null 
        }, "*");
      }
    }
  }, [activeSection, iframeRef]);

  const handleHighlight = useCallback(() => {
    // A lógica de destaque pode ser implementada diretamente no preview
    // ou via CSS condicional baseada no activeSection
  }, []);

  const activePageData = pages.find((p: PageItem) => p.id === activePage);
  const activeSectionData = Object.values(sections).flat().find((s: SectionItem) => s.id === activeSection);
  const previewUrl = useMemo(() => {
    let url = activePageData?.path === "/" ? "/?preview=true" : `${activePageData?.path}?preview=true`;
    if (activeSection) {
      url += `&only=${activeSection}`;
    }
    return url;
  }, [activePageData, activeSection]);

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
