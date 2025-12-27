/**
 * Hook para gerenciar a navegação interna do editor de site.
 * Controla qual página e seção estão ativas, expansão de menus
 * e comandos de scroll/destaque para o iframe.
 */
import { type RefObject, useCallback, useState } from "react";
import { pages, sections } from "../components/editor-constants";

export function useNavigationManager(iframeRef: RefObject<HTMLIFrameElement | null>) {
  const [activePage, setActivePage] = useState("layout");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedPages, setExpandedPages] = useState<string[]>(["layout", "inicio"]);

  const togglePageExpansion = useCallback((pageId: string) => {
    setExpandedPages((prev) => 
      prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]
    );
    const page = pages.find((p) => p.id === pageId);
    if (page) setActivePage(pageId);
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "SCROLL_TO_SECTION", sectionId }, "*");
    }
  }, [iframeRef]);

  const handleHighlight = useCallback((sectionId: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "HIGHLIGHT_SECTION", sectionId }, "*");
    }
  }, [iframeRef]);

  const activePageData = pages.find((p) => p.id === activePage);
  const activeSectionData = Object.values(sections).flat().find((s) => s.id === activeSection);
  const previewUrl = activePageData?.path === "/" ? "/?preview=true" : `${activePageData?.path}?preview=true`;

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
