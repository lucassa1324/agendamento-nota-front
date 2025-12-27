/**
 * Constantes e definições de dados utilizadas no Editor de Site.
 * Inclui a estrutura de páginas, seções editáveis e lista de fontes disponíveis.
 */
import { Calendar, ImageIcon, Info, Layout, type LucideIcon, Settings2 } from "lucide-react";

export interface PageItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  hidden?: boolean;
}

export const pages: PageItem[] = [
  { id: "layout", label: "Layout Global", icon: Settings2, path: "/" },
  { id: "inicio", label: "Início", icon: Layout, path: "/" },
  { id: "galeria", label: "Galeria", icon: ImageIcon, path: "/galeria" },
  { id: "sobre", label: "Sobre Nós", icon: Info, path: "/sobre", hidden: true },
  { id: "agendar", label: "Agendar", icon: Calendar, path: "/agendamento", hidden: true },
];

export interface SectionItem {
  id: string;
  name: string;
  description: string;
}

export const sections: Record<string, SectionItem[]> = {
  layout: [
    { id: "header", name: "Cabeçalho", description: "Logo e menu de navegação" },
    { id: "typography", name: "Tipografia", description: "Fontes e estilos de texto" },
    { id: "footer", name: "Rodapé", description: "Informações de contato e links" },
  ],
  inicio: [
    { id: "hero", name: "Banner Principal", description: "Primeira dobra com logo e botão de agendar" },
    { id: "services", name: "Nossos Serviços", description: "Lista de serviços em destaque" },
    { id: "values", name: "Nossos Valores", description: "Diferenciais e pilares do atendimento" },
    { id: "gallery-preview", name: "Prévia da Galeria", description: "Alguns trabalhos recentes" },
    { id: "cta", name: "Chamada para Ação", description: "Botão final para incentivar o agendamento" },
  ],
  galeria: [
    { id: "gallery-grid", name: "Grid de Fotos", description: "Todas as fotos do portfólio" },
  ],
  sobre: [
    { id: "about-hero", name: "Banner Sobre Nós", description: "Título e introdução da página" },
    { id: "story", name: "Nossa História", description: "Trajetória detalhada" },
    { id: "values", name: "Nossos Valores", description: "Pilares do studio" },
  ],
  agendar: [
    { id: "booking", name: "Fluxo de Agendamento", description: "Calendário e seleção de serviços" },
  ],
};

export const EDITOR_FONTS = [
  { name: "Playfair Display", type: "serif" },
  { name: "Lora", type: "serif" },
  { name: "Merriweather", type: "serif" },
  { name: "Cormorant Garamond", type: "serif" },
  { name: "Cinzel", type: "serif" },
  { name: "Inter", type: "sans" },
  { name: "Montserrat", type: "sans" },
  { name: "Poppins", type: "sans" },
  { name: "Roboto", type: "sans" },
  { name: "Open Sans", type: "sans" },
];
