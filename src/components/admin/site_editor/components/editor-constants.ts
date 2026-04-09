/**
 * Constantes e definições de dados utilizadas no Editor de Site.
 * Inclui a estrutura de páginas, seções editáveis e lista de fontes disponíveis.
 */
import {
  Calendar,
  ImageIcon,
  Info,
  Layout,
  type LucideIcon,
  Settings2,
} from "lucide-react";

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
  {
    id: "agendar",
    label: "Agendar",
    icon: Calendar,
    path: "/agendamento",
    hidden: true,
  },
];

export interface SectionItem {
  id: string;
  name: string;
  description: string;
}

export const sections: Record<string, SectionItem[]> = {
  layout: [
    {
      id: "layout-header",
      name: "Cabeçalho",
      description: "Logo e menu de navegação",
    },
    {
      id: "typography",
      name: "Tipografia",
      description: "Fontes e estilos de texto",
    },
    {
      id: "colors",
      name: "Cores do Site",
      description: "Esquema de cores global",
    },
    {
      id: "layout-footer",
      name: "Rodapé",
      description: "Informações de contato e links",
    },
  ],
  inicio: [
    {
      id: "home-hero",
      name: "Banner Principal",
      description: "Primeira dobra com logo e botão de agendar",
    },
    {
      id: "home-services",
      name: "Nossos Serviços",
      description: "Lista de serviços em destaque",
    },
    {
      id: "home-values",
      name: "Nossos Valores",
      description: "Diferenciais e pilares do atendimento",
    },
    {
      id: "home-gallery",
      name: "Prévia da Galeria",
      description: "Alguns trabalhos recentes",
    },
    {
      id: "home-cta",
      name: "Chamada para Ação",
      description: "Botão final para incentivar o agendamento",
    },
  ],
  galeria: [
    {
      id: "page-gallery",
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
      id: "home-story",
      name: "Nossa História",
      description: "Trajetóra detalhada",
    },
    {
      id: "about-values",
      name: "Nossos Valores",
      description: "Pilares do studio",
    },
    {
      id: "home-team",
      name: "Nossa Equipe",
      description: "Profissionais do studio",
    },
    {
      id: "home-testimonials",
      name: "O que dizem nossas clientes",
      description: "Depoimentos e avaliações",
    },
  ],
  agendar: [
    {
      id: "booking-service",
      name: "Passo 1: Serviços",
      description: "Configuração da seleção de serviços",
    },
    {
      id: "booking-date",
      name: "Passo 2: Data",
      description: "Configuração da escolha do dia",
    },
    {
      id: "booking-time",
      name: "Passo 3: Horário",
      description: "Configuração da escolha do horário",
    },
    {
      id: "booking-form",
      name: "Passo 4: Dados do Cliente",
      description: "Configuração do formulário de contato",
    },
    {
      id: "booking-confirmation",
      name: "Passo 5: Confirmação",
      description: "Configuração da tela de sucesso",
    },
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
