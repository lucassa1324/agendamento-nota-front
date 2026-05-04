"use client";

import { LayoutGrid, Search, Filter, Eye, Sparkles, Home, Image as ImageIcon, Calendar, Users, Maximize2, Code2, Monitor, Smartphone, Database, Loader2, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type HeroTemplatePreset,
  type ServicesTemplatePreset,
} from "@/components/admin/site_editor/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/auth-client";
import { homeHeroTemplates } from "@/components/admin/site_editor/editor/pagina-inicial/banner-principal/templates";
import { homeServicesTemplates } from "@/components/admin/site_editor/editor/pagina-inicial/nossos-servicos/templates";

// Reaproveitando a lógica de ícones e fontes do hero-editor.tsx
const iconMap: Record<string, any> = {
  Sparkles: LucideIcons.Sparkles,
  Star: LucideIcons.Star,
  Heart: LucideIcons.Heart,
  Crown: LucideIcons.Crown,
  Flower2: LucideIcons.Flower2,
  Moon: LucideIcons.Moon,
  Sun: LucideIcons.Sun,
  Gem: LucideIcons.Gem,
  Smile: LucideIcons.Smile,
  Award: LucideIcons.Award,
};

interface MasterTemplatesResponse {
  banner: HeroTemplatePreset[];
  servicos: ServicesTemplatePreset[];
  historia: any[];
  equipe: any[];
}

type HtmlLabMainSection = "home" | "gallery" | "booking" | "about";

interface HtmlThemeTemplate {
  id: string;
  niche: string;
  section: HtmlLabMainSection;
  subsection: string;
  variationName: string;
  html: string;
}

const htmlLabSections: Array<{
  id: HtmlLabMainSection;
  name: string;
  icon: any;
  subsections: Array<{ id: string; name: string }>;
}> = [
  {
    id: "home",
    name: "Início",
    icon: Home,
    subsections: [
      { id: "hero", name: "Hero (Banner Principal)" },
      { id: "services", name: "Serviços" },
      { id: "differentials", name: "Diferenciais" },
      { id: "gallery-preview", name: "Preview Galeria" },
      { id: "cta", name: "Chamada (CTA)" },
    ],
  },
  {
    id: "gallery",
    name: "Galeria",
    icon: ImageIcon,
    subsections: [{ id: "gallery-grid", name: "Grade de Fotos" }],
  },
  {
    id: "booking",
    name: "Agendar",
    icon: Calendar,
    subsections: [{ id: "booking-flow", name: "Fluxo de Agendamento" }],
  },
  {
    id: "about",
    name: "Sobre Nós",
    icon: Users,
    subsections: [
      { id: "about-hero", name: "Hero Sobre" },
      { id: "about-team", name: "Equipe" },
      { id: "about-history", name: "História" },
    ],
  },
];

const htmlLabSeedThemes: HtmlThemeTemplate[] = [
  {
    id: "html-hero-elegante",
    niche: "Studio de Sobrancelha",
    section: "home",
    subsection: "hero",
    variationName: "Elegante & Minimalista",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,Arial;background:linear-gradient(135deg,#111827,#1f2937);color:#fff}.wrap{height:100vh;display:flex;align-items:center;justify-content:center;padding:48px;text-align:center}.badge{display:inline-block;padding:8px 14px;border-radius:999px;background:#ffffff22;font-size:12px;letter-spacing:.08em;text-transform:uppercase}.title{font-size:56px;line-height:1.05;margin:18px 0 10px;font-weight:900}.sub{max-width:760px;margin:0 auto 30px;color:#e5e7eb}.btn{display:inline-block;padding:14px 26px;border-radius:999px;font-weight:700;text-decoration:none}.btn-a{background:#fff;color:#111827}.btn-b{border:2px solid #fff;color:#fff;margin-left:12px}</style></head><body><section class="wrap"><div><span class="badge">Design Premium</span><h1 class="title">Olhar marcante e natural</h1><p class="sub">Teste de tema em HTML puro para validação offline antes de publicar.</p><a class="btn btn-a" href="#">Agendar Agora</a><a class="btn btn-b" href="#">Ver Galeria</a></div></section></body></html>`,
  },
  {
    id: "html-hero-vibrante",
    niche: "Manicure e Pedicure",
    section: "home",
    subsection: "hero",
    variationName: "Moderno & Vibrante",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Poppins,Arial;background:#09090b;color:#fafafa}.hero{height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 20% 20%,#ec489955,transparent 40%),radial-gradient(circle at 80% 20%,#22d3ee55,transparent 40%),#09090b}.box{max-width:920px;text-align:center;padding:40px}.kicker{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#f472b6}.title{font-size:58px;line-height:1.02;font-weight:900;margin:12px 0 14px}.sub{color:#d4d4d8;max-width:700px;margin:0 auto 28px}.cta{background:#f472b6;color:#111827;padding:14px 28px;border-radius:999px;font-weight:800;text-decoration:none;display:inline-block}</style></head><body><section class="hero"><div class="box"><div class="kicker">Nova Tendencia</div><h1 class="title">Transforme seu visual hoje</h1><p class="sub">Variações em HTML podem ser geradas e testadas sem impactar o site online.</p><a class="cta" href="#">Quero Agendar</a></div></section></body></html>`,
  },
  {
    id: "html-hero-perfeicao",
    niche: "Studio de Sobrancelha",
    section: "home",
    subsection: "hero",
    variationName: "Minimalista & Sofisticado",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,Arial;background:#18181b;color:#fff}.wrap{height:100vh;display:flex;align-items:center;justify-content:center;padding:48px;text-align:center}.badge{display:inline-block;padding:8px 14px;border-radius:999px;background:#ffffff22;font-size:12px;letter-spacing:.08em;text-transform:uppercase}.title{font-size:56px;line-height:1.05;margin:18px 0 10px;font-weight:900}.sub{max-width:760px;margin:0 auto 30px;color:#e5e7eb}.btn{display:inline-block;padding:14px 26px;border-radius:999px;font-weight:700;text-decoration:none}.btn-a{background:#fff;color:#111827}.btn-b{border:2px solid #fff;color:#fff;margin-left:12px}</style></head><body><section class="wrap"><div><span class="badge">Vip Experience</span><h1 class="title">A perfeição em cada traço</h1><p class="sub">Eleve sua autoestima com um olhar renovado e expressivo.</p><a class="btn btn-a" href="#">Agendar Agora</a></div></section></body></html>`,
  },
  {
    id: "html-hero-maos",
    niche: "Manicure e Pedicure",
    section: "home",
    subsection: "hero",
    variationName: "Suas Mãos Merecem",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,Arial;background:#fdf4f5;color:#111827}.wrap{height:100vh;display:flex;align-items:center;justify-content:center;padding:48px;text-align:center}.badge{display:inline-block;padding:8px 14px;border-radius:999px;background:#fbcfe8;color:#be185d;font-size:12px;letter-spacing:.08em;text-transform:uppercase}.title{font-size:56px;line-height:1.05;margin:18px 0 10px;font-weight:900}.sub{max-width:760px;margin:0 auto 30px;color:#4b5563}.btn{display:inline-block;padding:14px 26px;border-radius:999px;font-weight:700;text-decoration:none}.btn-a{background:#be185d;color:#fff}.btn-b{border:2px solid #be185d;color:#be185d;margin-left:12px}</style></head><body><section class="wrap"><div><span class="badge">Cuidado & Higiene</span><h1 class="title">Suas Mãos Merecem esse Cuidado</h1><p class="sub">Unhas impecáveis com os melhores produtos do mercado.</p><a class="btn btn-a" href="#">Agendar Agora</a></div></section></body></html>`,
  },
  {
    id: "html-hero-luxo",
    niche: "Estética Avançada",
    section: "home",
    subsection: "hero",
    variationName: "Luxo & Noite",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:'Times New Roman',serif;background:#0a0a0a;color:#d4af37}.wrap{height:100vh;display:flex;align-items:center;justify-content:center;padding:48px;text-align:center;background:radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)}.gold-text{background:linear-gradient(to bottom, #d4af37 20%, #f7ef8a 50%, #d4af37 80%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.title{font-size:72px;font-weight:400;letter-spacing:-2px;margin-bottom:20px;line-height:1}.sub{font-family:Inter,sans-serif;color:#888;max-width:600px;margin:0 auto 40px;letter-spacing:2px;text-transform:uppercase;font-size:12px}.btn{font-family:Inter,sans-serif;display:inline-block;padding:18px 48px;border:1px solid #d4af37;color:#d4af37;text-decoration:none;font-size:14px;letter-spacing:3px;text-transform:uppercase;transition:all 0.4s ease}.btn:hover{background:#d4af37;color:#000}</style></head><body><section class="wrap"><div><p class="sub">A experiência definitiva em beleza</p><h1 class="title gold-text">A Arte da<br>Perfeição</h1><div style="height:2px;width:60px;background:#d4af37;margin:30px auto"></div><a class="btn" href="#">Reserve sua Experiência</a></div></section></body></html>`,
  },
  {
    id: "html-hero-organico",
    niche: "Studio de Yoga & Bem-Estar",
    section: "home",
    subsection: "hero",
    variationName: "Natural & Orgânico",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,sans-serif;background:#fcf9f4;color:#2d3e35}.wrap{height:100vh;display:flex;align-items:center;justify-content:center;padding:48px;text-align:center}.blob{position:absolute;z-index:0;filter:blur(60px);opacity:0.4}.title{font-size:64px;font-weight:300;margin-bottom:24px;position:relative;z-index:1}.sub{font-size:18px;max-width:550px;margin:0 auto 40px;line-height:1.6;color:#5a7065;position:relative;z-index:1}.btn{display:inline-block;padding:16px 40px;background:#2d3e35;color:#fff;text-decoration:none;border-radius:100px;font-weight:600;transition:all 0.3s ease;position:relative;z-index:1}.btn:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(45,62,53,0.2)}</style></head><body><section class="wrap"><div class="blob" style="width:400px;height:400px;background:#d4e2d4;top:10%;left:20%;border-radius:40% 60% 70% 30% / 40% 50% 60% 50%"></div><div class="blob" style="width:300px;height:300px;background:#e9d5da;bottom:15%;right:25%;border-radius:30% 70% 50% 50% / 50% 30% 70% 50%"></div><div><h1 class="title">Encontre seu<br><b>Equilíbrio</b></h1><p class="sub">Espaço dedicado ao autocuidado e à conexão interior. Práticas personalizadas para o seu ritmo.</p><a class="btn" href="#">Agendar Prática</a></div></section></body></html>`,
  },
  {
    id: "html-hero-futurista",
    niche: "Barbearia Tech",
    section: "home",
    subsection: "hero",
    variationName: "Futurista & Cyber",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:'Space Grotesk',sans-serif;background:#050505;color:#fff;overflow:hidden}.wrap{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),repeating-linear-gradient(0deg, transparent, transparent 1px, #111 1px, #111 2px);background-size: 100% 3px}.title{font-size:100px;font-weight:900;text-transform:uppercase;margin:0;line-height:0.9;font-style:italic;background:linear-gradient(90deg, #fff, #3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 30px rgba(59,130,246,0.5))}.sub{font-size:14px;letter-spacing:8px;text-transform:uppercase;margin-top:20px;color:#3b82f6;font-weight:700}.btn{margin-top:50px;padding:20px 60px;background:#fff;color:#000;text-decoration:none;font-weight:900;text-transform:uppercase;letter-spacing:4px;clip-path: polygon(10% 0, 100% 0, 90% 100%, 0% 100%);transition:all 0.2s ease}.btn:hover{background:#3b82f6;color:#fff;transform:skew(-5deg)}</style></head><body><section class="wrap"><h1 class="title">Style<br>Matrix</h1><p class="sub">Next Gen Grooming Experience</p><a class="btn" href="#">Initialize Service</a></section></body></html>`,
  },
  {
    id: "html-hero-editorial",
    niche: "Estúdio de Moda",
    section: "home",
    subsection: "hero",
    variationName: "Editorial & Revista",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,sans-serif;background:#fff;color:#000}.wrap{height:100vh;display:grid;grid-template-columns:1fr 1fr;padding:0}.left{display:flex;flex-direction:column;justify-content:center;padding:80px;border-right:1px solid #eee}.right{background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:200px;font-weight:900;color:#eee}.title{font-size:120px;line-height:0.8;font-weight:900;margin-bottom:40px;letter-spacing:-8px}.sub{font-size:24px;line-height:1.2;max-width:400px;margin-bottom:60px;font-weight:500}.btn{width:fit-content;padding:24px 64px;background:#000;color:#fff;text-decoration:none;font-weight:700;font-size:18px;transition:all 0.3s ease}.btn:hover{padding-left:84px;background:#333}</style></head><body><section class="wrap"><div class="left"><h1 class="title">THE<br>NEW<br>YOU</h1><p class="sub">A nova coleção de visuais para a temporada de 2026 chegou ao studio.</p><a class="btn" href="#">Ver Editorial</a></div><div class="right">MODE</div></section></body></html>`,
  },
  {
    id: "html-hero-estetica-resultados",
    niche: "Clínica de Estética",
    section: "home",
    subsection: "hero",
    variationName: "Estética de Resultados",
    html: `<!doctype html><html lang="pt-br"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet"><style>body{margin:0;font-family:'Montserrat',sans-serif;background:#fafafa;color:#333}.wrap{height:100vh;display:flex;align-items:center;justify-content:center;padding:48px;text-align:center;background:linear-gradient(rgba(255,255,255,.7),rgba(255,255,255,.7)),url('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1920&auto=format&fit=crop');background-size:cover;background-position:center}.content{max-width:800px}.badge{display:inline-block;padding:6px 20px;border-radius:2px;background:#bc9c82;color:#fff;font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;margin-bottom:20px}.title{font-family:'Playfair Display',serif;font-size:clamp(38px,7vw,72px);line-height:1.1;margin:0 0 20px;font-weight:700;color:#2c2c2c;font-style:italic}.sub{max-width:550px;margin:0 auto 40px;color:#555;font-size:18px;line-height:1.8;font-weight:300}.btn-group{display:flex;gap:15px;justify-content:center}.btn{display:inline-block;padding:18px 40px;text-decoration:none;transition:all .4s ease;font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase}.btn-a{background:#2c2c2c;color:#fff;border:1px solid #2c2c2c}.btn-a:hover{background:#bc9c82;border-color:#bc9c82;transform:translateY(-3px)}.btn-b{border:1px solid #2c2c2c;color:#2c2c2c}.btn-b:hover{background:rgba(0,0,0,.05)}@media (max-width:600px){.btn-group{flex-direction:column}.btn{width:100%;box-sizing:border-box}}</style></head><body><section class="wrap"><div class="content"><span class="badge">Estética de Resultados</span><h1 class="title">Realce sua beleza de forma única</h1><p class="sub">Protocolos personalizados e tecnologia de ponta para elevar sua autoestima com naturalidade.</p><div class="btn-group"><a class="btn btn-a" href="#">Agendar Avaliação</a><a class="btn btn-b" href="#">Conhecer Procedimentos</a></div></div></section></body></html>`,
  },
  {
    id: "html-gallery-grid",
    niche: "Clinicas em Geral",
    section: "gallery",
    subsection: "gallery-grid",
    variationName: "Grid Clean",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,Arial;background:#f8fafc;color:#0f172a}.wrap{padding:48px}.title{font-size:34px;font-weight:900;margin:0 0 24px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.item{background:#fff;border-radius:18px;padding-top:70%;position:relative;overflow:hidden;border:1px solid #e2e8f0}.item span{position:absolute;left:12px;bottom:10px;background:#0f172a;color:#fff;font-size:12px;padding:6px 10px;border-radius:999px}</style></head><body><main class="wrap"><h1 class="title">Galeria de Resultados</h1><section class="grid"><article class="item"><span>Design 1</span></article><article class="item"><span>Design 2</span></article><article class="item"><span>Design 3</span></article><article class="item"><span>Design 4</span></article><article class="item"><span>Design 5</span></article><article class="item"><span>Design 6</span></article></section></main></body></html>`,
  },
  {
    id: "html-services-cards",
    niche: "Studio de Sobrancelha",
    section: "home",
    subsection: "services",
    variationName: "Cards Elegantes",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,Arial;background:#fff;color:#111827}.wrap{padding:60px 24px;max-width:1200px;margin:0 auto}.title{text-align:center;font-size:32px;font-weight:900;margin-bottom:40px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.card{padding:32px;border-radius:24px;background:#f9fafb;border:1px solid #f3f4f6;transition:all .3s ease}.card:hover{transform:translateY(-5px);box-shadow:0 10px 20px rgba(0,0,0,0.05)}.icon{width:48px;height:48px;background:#111827;border-radius:12px;margin-bottom:20px}.card h3{font-size:20px;font-weight:700;margin-bottom:12px}.card p{color:#4b5563;font-size:14px;line-height:1.6}</style></head><body><div class="wrap"><h2 class="title">Nossos Serviços</h2><div class="grid"><div class="card"><div class="icon"></div><h3>Microblading</h3><p>Técnica fio a fio para sobrancelhas naturais e expressivas.</p></div><div class="card"><div class="icon"></div><h3>Design com Henna</h3><p>Realce seu olhar com um design personalizado e duradouro.</p></div><div class="card"><div class="icon"></div><h3>Lash Lifting</h3><p>Curvatura e hidratação para seus cílios naturais.</p></div></div></div></body></html>`,
  },
  {
    id: "html-differentials-list",
    niche: "Geral",
    section: "home",
    subsection: "differentials",
    variationName: "Diferenciais Iconográficos",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,Arial;background:#111827;color:#fff}.wrap{padding:80px 24px;display:grid;grid-template-columns:1fr 1fr;gap:60px;max-width:1200px;margin:0 auto;align-items:center}.title{font-size:42px;font-weight:900;line-height:1.1;margin-bottom:24px}.item{display:flex;gap:16px;margin-bottom:24px}.dot{width:12px;height:12px;background:#3b82f6;border-radius:50%;margin-top:6px}.item h4{font-size:18px;font-weight:700;margin:0 0 4px}.item p{color:#94a3b8;font-size:14px}</style></head><body><div class="wrap"><div><h2 class="title">Por que escolher nosso Studio?</h2><p style="color:#94a3b8;margin-bottom:32px">Combinamos técnica, arte e biossegurança para entregar o melhor resultado para você.</p></div><div><div class="item"><div class="dot"></div><div><h4>Profissionais Certificados</h4><p>Especialistas com formação internacional e vasta experiência.</p></div></div><div class="item"><div class="dot"></div><div><h4>Materiais Premium</h4><p>Utilizamos apenas os melhores produtos do mercado mundial.</p></div></div><div class="item"><div class="dot"></div><div><h4>Biossegurança Total</h4><p>Ambiente rigorosamente esterilizado para sua total segurança.</p></div></div></div></div></body></html>`,
  },
  {
    id: "html-cta-dark",
    niche: "Geral",
    section: "home",
    subsection: "cta",
    variationName: "CTA de Alto Impacto",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,Arial;background:#fff;padding:40px}.banner{background:linear-gradient(135deg,#6366f1,#a855f7);padding:60px;border-radius:40px;text-align:center;color:#fff}.title{font-size:40px;font-weight:900;margin-bottom:16px}.sub{font-size:18px;opacity:0.9;margin-bottom:32px;max-width:600px;margin-left:auto;margin-right:auto}.btn{background:#fff;color:#6366f1;padding:16px 40px;border-radius:999px;font-weight:800;text-decoration:none;display:inline-block;transition:transform .2s ease}.btn:hover{transform:scale(1.05)}</style></head><body><div class="banner"><h2 class="title">Pronta para transformar seu olhar?</h2><p class="sub">Agende agora sua avaliação gratuita e descubra o design perfeito para o seu rosto.</p><a href="#" class="btn">Quero Agendar Agora</a></div></body></html>`,
  },
  {
    id: "html-booking-flow-simple",
    niche: "Geral",
    section: "booking",
    subsection: "booking-flow",
    variationName: "Fluxo de Agendamento Moderno",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,Arial;background:#f3f4f6;padding:40px}.card{background:#fff;max-width:800px;margin:0 auto;border-radius:32px;padding:40px;box-shadow:0 20px 50px rgba(0,0,0,0.05)}.header{text-align:center;margin-bottom:40px}.steps{display:flex;justify-content:center;gap:40px;margin-bottom:40px}.step{display:flex;flex-direction:column;align-items:center;gap:8px}.circle{width:32px;height:32px;border-radius:50%;background:#e5e7eb;display:grid;place-items:center;font-weight:700;font-size:12px}.active .circle{background:#111827;color:#fff}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.option{border:2px solid #f3f4f6;padding:20px;border-radius:16px;cursor:pointer;transition:border .2s ease}.option:hover{border-color:#111827}</style></head><body><div class="card"><div class="header"><h1>Agendar Horário</h1><p>Selecione o serviço desejado abaixo</p></div><div class="steps"><div class="step active"><div class="circle">1</div><span style="font-size:10px;font-weight:800;text-transform:uppercase">Serviço</span></div><div class="step"><div class="circle">2</div><span style="font-size:10px;font-weight:800;text-transform:uppercase">Data</span></div><div class="step"><div class="circle">3</div><span style="font-size:10px;font-weight:800;text-transform:uppercase">Confirmação</span></div></div><div class="grid"><div class="option"><b>Design Sobrancelha</b><br><small>45 min • R$ 50,00</small></div><div class="option"><b>Microblading</b><br><small>2h • R$ 450,00</small></div><div class="option"><b>Lash Lifting</b><br><small>1h 15min • R$ 120,00</small></div><div class="option"><b>Extensão Cílios</b><br><small>2h 30min • R$ 180,00</small></div></div></div></body></html>`,
  },
  {
    id: "html-about-team-grid",
    niche: "Geral",
    section: "about",
    subsection: "about-team",
    variationName: "Equipe Minimalista",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,Arial;background:#fff;padding:60px 24px}.wrap{max-width:1200px;margin:0 auto;text-align:center}.title{font-size:36px;font-weight:900;margin-bottom:48px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}.member{text-align:center}.photo{width:160px;height:160px;background:#f3f4f6;border-radius:50%;margin:0 auto 20px}.member h3{font-size:20px;font-weight:800;margin:0}.member span{color:#6b7280;font-size:14px;text-transform:uppercase;letter-spacing:.05em}</style></head><body><div class="wrap"><h2 class="title">Nossos Especialistas</h2><div class="grid"><div class="member"><div class="photo"></div><h3>Ana Silva</h3><span>Master Designer</span></div><div class="member"><div class="photo"></div><h3>Julia Costa</h3><span>Lash Designer</span></div><div class="member"><div class="photo"></div><h3>Carla Mendes</h3><span>Dermopigmentadora</span></div></div></div></body></html>`,
  },
  {
    id: "html-about-history-side",
    niche: "Geral",
    section: "about",
    subsection: "about-history",
    variationName: "História & Legado",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,Arial;background:#fff;color:#111827;padding:80px 24px}.wrap{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}.image{aspect-ratio:4/5;background:#f3f4f6;border-radius:40px}.content h2{font-size:40px;font-weight:900;line-height:1.1;margin-bottom:24px}.content p{color:#4b5563;font-size:16px;line-height:1.8;margin-bottom:20px}</style></head><body><div class="wrap"><div class="image"></div><div class="content"><h2>Nossa Trajetória</h2><p>Fundado em 2015, nosso studio nasceu do desejo de elevar a autoestima feminina através de técnicas inovadoras e um atendimento humanizado.</p><p>Hoje somos referência no mercado, com mais de 10 mil procedimentos realizados e uma equipe apaixonada pelo que faz.</p></div></div></body></html>`,
  },
  {
    id: "html-gallery-preview-grid",
    niche: "Geral",
    section: "home",
    subsection: "gallery-preview",
    variationName: "Preview de Galeria",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,Arial;background:#fff;padding:60px 24px}.wrap{max-width:1200px;margin:0 auto;text-align:center}.title{font-size:32px;font-weight:900;margin-bottom:40px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.item{aspect-ratio:1;background:#f3f4f6;border-radius:16px;overflow:hidden}.btn{margin-top:32px;display:inline-block;padding:12px 32px;border:2px solid #111827;border-radius:999px;font-weight:700;text-decoration:none;color:#111827}</style></head><body><div class="wrap"><h2 class="title">Siga-nos no Instagram</h2><div class="grid"><div class="item"></div><div class="item"></div><div class="item"></div><div class="item"></div></div><a href="#" class="btn">Ver Galeria Completa</a></div></body></html>`,
  },
  {
    id: "html-about-hero-clean",
    niche: "Geral",
    section: "about",
    subsection: "about-hero",
    variationName: "Hero Sobre Minimal",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,Arial;background:#111827;color:#fff;text-align:center;padding:100px 24px}.wrap{max-width:800px;margin:0 auto}.title{font-size:56px;font-weight:900;margin-bottom:24px}.sub{font-size:20px;color:#94a3b8;line-height:1.6}</style></head><body><div class="wrap"><h1 class="title">Beleza com Propósito</h1><p class="sub">Conheça a história por trás do studio que está transformando o conceito de estética em nossa cidade.</p></div></body></html>`,
  },
];

function HtmlThemeLab({ onSaveSuccess }: { onSaveSuccess?: () => void }) {
  const [activeMainSection, setActiveMainSection] = useState<HtmlLabMainSection>("home");
  const [activeSubsection, setActiveSubsection] = useState("hero");
  const [selectedNiche, setSelectedNiche] = useState("Todos");
  const [themes, setThemes] = useState<HtmlThemeTemplate[]>(htmlLabSeedThemes);
  const [selectedThemeId, setSelectedThemeId] = useState(htmlLabSeedThemes[0]?.id ?? "");
  const [htmlDraft, setHtmlDraft] = useState(htmlLabSeedThemes[0]?.html ?? "");
  const [previewTheme, setPreviewTheme] = useState<HtmlThemeTemplate | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isSavingToDb, setIsSavingToDb] = useState(false);

  const uniqueNiches = useMemo(() => {
    const counts: Record<string, number> = {};
    themes.forEach((t) => {
      counts[t.niche] = (counts[t.niche] || 0) + 1;
    });
    return [
      { name: "Todos", count: themes.length },
      ...Object.entries(counts).map(([name, count]) => ({ name, count })),
    ];
  }, [themes]);

  const filteredThemes = useMemo(() => {
    return themes.filter((t) => {
      const sectionOk = t.section === activeMainSection;
      const subsectionOk = t.subsection === activeSubsection;
      const nicheOk = selectedNiche === "Todos" || t.niche === selectedNiche;
      return sectionOk && subsectionOk && nicheOk;
    });
  }, [themes, activeMainSection, activeSubsection, selectedNiche]);

  const selectedTheme = useMemo(
    () => themes.find((t) => t.id === selectedThemeId) || filteredThemes[0] || null,
    [themes, filteredThemes, selectedThemeId]
  );

  useEffect(() => {
    if (!selectedTheme) return;
    setSelectedThemeId(selectedTheme.id);
    setHtmlDraft(selectedTheme.html);
  }, [selectedTheme?.id]);

  const applyHtmlChanges = () => {
    if (!selectedTheme) return;
    setThemes((prev) =>
      prev.map((t) => (t.id === selectedTheme.id ? { ...t, html: htmlDraft } : t))
    );
  };

  const handleSaveHtmlToDb = async () => {
    if (!selectedTheme) return;
    setIsSavingToDb(true);
    try {
      // Mapeamento de seção para o banco
      let sectionType = activeSubsection;
      if (activeSubsection === "hero") sectionType = "banner";
      if (activeSubsection === "services") sectionType = "servicos";
      if (activeSubsection === "about-team") sectionType = "equipe";
      if (activeSubsection === "about-history") sectionType = "historia";

      // Validar se a seção é suportada pelo banco de dados
      const supportedSections = ["banner", "servicos", "historia", "equipe"];
      if (!supportedSections.includes(sectionType)) {
        toast.error(`A seção "${activeSubsection}" ainda não suporta publicação como template.`);
        return;
      }

      const payload = {
        templateId: "template_1",
        variationKey: selectedTheme.id,
        variationName: selectedTheme.variationName,
        niche: selectedTheme.niche,
        sectionType,
        config: {
          isCustomHtml: true,
          htmlCode: htmlDraft,
          niche: selectedTheme.niche,
          variationName: selectedTheme.variationName,
          id: selectedTheme.id,
        },
      };

      const response = await customFetch(`${API_BASE_URL}/api/admin/master/templates`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar template (${response.status})`);
      }

      toast.success(`${selectedTheme.variationName} salvo no banco com sucesso!`);
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      console.error("Erro ao salvar template HTML no banco:", error);
      toast.error("Falha ao salvar template no banco de dados.");
    } finally {
      setIsSavingToDb(false);
    }
  };

  const createNewVariation = () => {
    const id = `html-${Date.now()}`;
    const newTheme: HtmlThemeTemplate = {
      id,
      niche: selectedNiche === "Todos" ? "Geral" : selectedNiche,
      section: activeMainSection,
      subsection: activeSubsection,
      variationName: `Nova Variacao ${themes.length + 1}`,
      html: htmlDraft || "<section><h1>Novo Tema</h1></section>",
    };
    setThemes((prev) => [newTheme, ...prev]);
    setSelectedThemeId(id);
  };

  return (
    <div className="space-y-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 min-h-50">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Sidebar Estilizada conforme a Imagem */}
        <aside className="xl:col-span-3 space-y-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-6 pl-2">SEÇÕES DO SITE BASE</p>
            <div className="space-y-2">
              {htmlLabSections.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === activeMainSection;
                return (
                  <div key={section.id} className="space-y-1">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-11 px-4 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-slate-100 text-slate-900 font-bold shadow-sm" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      )}
                      onClick={() => {
                        setActiveMainSection(section.id);
                        setActiveSubsection(section.subsections[0].id);
                      }}
                    >
                      <Icon className={cn("w-5 h-5", isActive ? "text-slate-900" : "text-slate-400")} />
                      <span className="text-sm">{section.name}</span>
                    </Button>
                    
                    {isActive && (
                      <div className="ml-10 space-y-1 pt-1 pb-2">
                        {section.subsections.map((sub) => (
                          <button
                            key={sub.id}
                            className={cn(
                              "w-full text-left text-[13px] rounded-lg px-3 py-2 transition-all duration-200",
                              activeSubsection === sub.id
                                ? "bg-black text-white font-bold shadow-md transform scale-[1.02]"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                            onClick={() => setActiveSubsection(sub.id)}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-6 pl-2">SELECIONE O NICHO</p>
            <div className="space-y-1">
              {uniqueNiches.map((nicheObj) => (
                <button
                  key={nicheObj.name}
                  className={cn(
                    "w-full flex items-center justify-between text-sm rounded-xl px-4 py-3 transition-all duration-200",
                    selectedNiche === nicheObj.name
                      ? "bg-slate-100 text-slate-900 font-bold shadow-sm"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  )}
                  onClick={() => setSelectedNiche(nicheObj.name)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      selectedNiche === nicheObj.name ? "bg-slate-900" : "bg-slate-300"
                    )} />
                    {nicheObj.name === "Todos" ? "Exibir Todos" : nicheObj.name}
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border",
                    selectedNiche === nicheObj.name 
                      ? "bg-white border-slate-200 text-slate-600" 
                      : "bg-slate-50 border-transparent text-slate-400"
                  )}>
                    {nicheObj.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Área de Conteúdo Principal */}
        <div className="xl:col-span-9 space-y-8">
          {/* Header de Visualização */}
          <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">MODO RASCUNHO (LAB)</span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                  Página {htmlLabSections.find(s => s.id === activeMainSection)?.name}
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {htmlLabSections.find((s) => s.id === activeMainSection)?.subsections.find((sub) => sub.id === activeSubsection)?.name}
              </h3>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                    <Users className="w-3 h-3 text-slate-400" />
                  </div>
                ))}
              </div>
              <div className="bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
                <span className="text-xs font-bold text-slate-600">
                  {filteredThemes.length}+ variações disponíveis
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-medium pl-1">
              Mostrando {filteredThemes.length} de {filteredThemes.length} templates para vitrine.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredThemes.length > 0 ? (
                filteredThemes.map((theme) => (
                  <div key={theme.id} className="group relative">
                    <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/20">
                      <div className="h-6 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-1.5 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      </div>
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        {/* Container para o Iframe Escalado (Thumbnail Desktop) */}
                        <div className="absolute inset-0 w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none bg-white z-0">
                          <iframe
                            title={theme.variationName}
                            srcDoc={theme.html}
                            sandbox=""
                            className="w-full h-full border-0"
                            style={{ overflow: 'hidden' }}
                          />
                        </div>
                        
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60 backdrop-blur-xs flex items-center justify-center gap-3 z-20">
                          <Button 
                            variant="secondary" 
                            className="rounded-full font-bold shadow-lg"
                            onClick={() => setPreviewTheme(theme)}
                          >
                            <Maximize2 className="w-4 h-4 mr-2" />
                            Visualizar
                          </Button>
                          <Button 
                            className="rounded-full font-bold shadow-lg"
                            onClick={() => setSelectedThemeId(theme.id)}
                          >
                            <Code2 className="w-4 h-4 mr-2" />
                            Editar HTML
                          </Button>
                        </div>
                      </div>
                      <div className="p-6 flex items-center justify-between bg-white border-t border-slate-50">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-black text-slate-900 tracking-tight">{theme.variationName}</p>
                            <span className="text-[9px] font-black bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                              Rascunho
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{theme.niche}</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                            {theme.id.split('-')[2] || 'HTML'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-2 rounded-[3rem] border-2 border-dashed border-slate-200 p-20 text-center bg-slate-50/30">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Sparkles className="w-10 h-10 text-slate-200" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">Nenhuma variação encontrada</h4>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Não existem templates HTML para esta seção e nicho. Que tal criar um novo agora?
                  </p>
                  <Button className="mt-8 rounded-full px-8 font-bold" onClick={createNewVariation}>
                    Criar Nova Variação
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Editor HTML Pro - Layout Vertical: Preview em cima, Código em baixo */}
      {selectedTheme && (
        <div className="mt-12 rounded-[3rem] border border-slate-200 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-hidden">
          {/* Header do Editor */}
          <div className="px-8 py-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">Editor HTML Pro</h4>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Editando: <span className="text-primary">{selectedTheme.variationName}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="rounded-full px-8 font-bold hover:bg-slate-100 transition-all" 
                onClick={() => setSelectedThemeId("")}
              >
                Cancelar
              </Button>
              <Button 
                className="rounded-full px-8 font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all" 
                onClick={applyHtmlChanges}
              >
                Salvar Alterações
              </Button>
              <Button 
                variant="secondary"
                className="rounded-full px-8 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200/50 hover:scale-105 active:scale-95 transition-all" 
                onClick={handleSaveHtmlToDb}
                disabled={isSavingToDb}
              >
                {isSavingToDb ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                Publicar como Template
              </Button>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            {/* Área de Visualização (Topo) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Visualização do Design</Label>
                
                {/* Toggle de Dispositivo */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      previewDevice === "desktop" 
                        ? "bg-white text-slate-900 shadow-sm" 
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      previewDevice === "mobile" 
                        ? "bg-white text-slate-900 shadow-sm" 
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Mobile
                  </button>
                </div>
              </div>

              <div className="flex justify-center bg-slate-50 border border-slate-100 rounded-[2.5rem] p-4 sm:p-8 overflow-hidden min-h-100 relative group transition-all duration-500">
                <div 
                  className={cn(
                    "bg-white shadow-2xl transition-all duration-500 overflow-hidden relative border border-slate-200",
                    previewDevice === "desktop" ? "w-full max-w-full aspect-video rounded-2xl" : "w-93.75 h-166.75 rounded-[3rem] border-8 border-slate-900"
                  )}
                >
                  {/* Browser/Phone Header Simulator */}
                  {previewDevice === "desktop" ? (
                    <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-1.5 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                    </div>
                  ) : (
                    <div className="h-6 bg-slate-900 flex items-center justify-center shrink-0">
                      <div className="w-12 h-1 rounded-full bg-slate-800" />
                    </div>
                  )}
                  
                  <iframe
                    title="preview-local-html"
                    srcDoc={htmlDraft}
                    sandbox=""
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            </div>
            
            {/* Área de Código (Baixo) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Código Fonte (HTML & CSS)</Label>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  EDIÇÃO EM TEMPO REAL
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-blue-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <Textarea
                  value={htmlDraft}
                  onChange={(e) => setHtmlDraft(e.target.value)}
                  className="relative min-h-75 font-mono text-sm leading-relaxed bg-slate-900 text-slate-300 border-none rounded-[2rem] p-8 shadow-2xl focus-visible:ring-2 focus-visible:ring-primary/30 custom-scrollbar"
                  placeholder="Cole aqui o HTML puro da variacao..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!previewTheme} onOpenChange={(open) => !open && setPreviewTheme(null)}>
        <DialogContent className="sm:max-w-[95vw] w-[95vw] h-[90vh] p-0 overflow-hidden border-none bg-slate-900 shadow-2xl rounded-3xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Preview do tema HTML</DialogTitle>
            <DialogDescription>Visualizacao local do tema em HTML puro.</DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col h-full w-full">
            {/* Browser Header Simulator */}
            <div className="h-12 bg-slate-100 border-b border-slate-200 flex items-center px-6 justify-between shrink-0">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              
              <div className="flex-1 max-w-xl mx-8">
                <div className="bg-white border border-slate-200 rounded-lg h-8 px-4 flex items-center gap-2">
                  <LucideIcons.Lock className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px] text-slate-500 font-medium truncate">
                    visualizando_preview/{previewTheme?.id}.html
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-200/50 px-2 py-1 rounded">
                  Desktop 1920x1080
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white relative">
              {previewTheme && (
                <iframe
                  title={previewTheme.variationName}
                  srcDoc={previewTheme.html}
                  sandbox=""
                  className="w-full h-full border-0"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TemplatePlayground({ initialData, onClose }: { initialData: HeroTemplatePreset | ServicesTemplatePreset | null, onClose: () => void }) {
  const isServices = initialData && 'cardBgColor' in initialData;
  
  const [data, setData] = useState<HeroTemplatePreset | ServicesTemplatePreset>(initialData || {
    id: "custom-template",
    niche: "Geral",
    variationName: "Custom Layout",
    title: "Seu Título de Impacto Aqui",
    subtitle: "Descreva seu serviço ou produto de forma clara e objetiva para converter mais clientes.",
    badge: "Nova Oferta",
    badgeIcon: "Sparkles",
    primaryButton: "Começar Agora",
    secondaryButton: "Saber Mais",
    bgType: "color",
    bgColor: "#111827",
    primaryButtonColor: "#ffffff",
    primaryButtonTextColor: "#111827",
    badgeColor: "rgba(255,255,255,0.1)",
    badgeTextColor: "#ffffff",
    titleSize: "lg",
  });
  const heroButtonShape = ((data as any).buttonShape as "pill" | "square" | "sharp" | undefined) || "pill";
  const heroBadgeShape = ((data as any).badgeShape as "pill" | "square" | "sharp" | undefined) || "pill";

  const updateData = (updates: Partial<HeroTemplatePreset & ServicesTemplatePreset>) => {
    setData(prev => ({ ...prev, ...updates } as any));
  };

  const heroData = data as HeroTemplatePreset;
  const servicesData = data as ServicesTemplatePreset;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Editor de Preview</h2>
          <p className="text-slate-500 text-sm">Monte e visualize seu template em tempo real antes de salvar.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>Voltar para Galeria</Button>
          <Button onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(data, null, 2));
            alert("Configuração copiada para a área de transferência!");
          }}>
            Copiar JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Controles */}
        <div className="xl:col-span-4 space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-h-200 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b pb-2">Informações Básicas</h3>
            <div className="space-y-2">
              <Label>Variação</Label>
              <Input value={data.variationName || ""} onChange={(e) => updateData({ variationName: e.target.value })} placeholder="Ex: Layout Moderno" />
            </div>
            <div className="space-y-2">
              <Label>Nicho</Label>
              <Input value={data.niche} onChange={(e) => updateData({ niche: e.target.value })} />
            </div>
          </div>

          {!isServices ? (
            // Controles Hero
            <div className="space-y-6 pt-4">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 border-b pb-2">Conteúdo do Banner</h3>
                <div className="space-y-2">
                  <Label>Badge (Texto pequeno)</Label>
                  <Input value={heroData.badge} onChange={(e) => updateData({ badge: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Ícone do Badge</Label>
                  <Select value={heroData.badgeIcon} onValueChange={(v) => updateData({ badgeIcon: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um ícone" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(iconMap).map(iconName => (
                        <SelectItem key={iconName} value={iconName}>{iconName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Textarea value={heroData.title} onChange={(e) => updateData({ title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Tamanho do Título</Label>
                  <Select value={heroData.titleSize || "lg"} onValueChange={(v) => updateData({ titleSize: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Pequeno</SelectItem>
                      <SelectItem value="md">Médio</SelectItem>
                      <SelectItem value="lg">Grande</SelectItem>
                      <SelectItem value="xl">Extra Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Textarea value={heroData.subtitle} onChange={(e) => updateData({ subtitle: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Botão Principal</Label>
                    <Input value={heroData.primaryButton} onChange={(e) => updateData({ primaryButton: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Botão Secundário</Label>
                    <Input value={heroData.secondaryButton} onChange={(e) => updateData({ secondaryButton: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 border-b pb-2">Estilo e Cores</h3>
                <div className="space-y-2">
                  <Label>Tipo de Fundo</Label>
                  <Select value={heroData.bgType || "color"} onValueChange={(v) => updateData({ bgType: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Cor Sólida</SelectItem>
                      <SelectItem value="image">Imagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {heroData.bgType === "image" ? (
                  <div className="space-y-2">
                    <Label>URL da Imagem</Label>
                    <Input value={heroData.bgImage || ""} onChange={(e) => updateData({ bgImage: e.target.value })} placeholder="https://..." />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={heroData.bgColor || "#111827"} onChange={(e) => updateData({ bgColor: e.target.value })} className="w-12 h-10 p-1" />
                      <Input value={heroData.bgColor || "#111827"} onChange={(e) => updateData({ bgColor: e.target.value })} className="flex-1" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cor Botão Primário</Label>
                    <Input type="color" value={heroData.primaryButtonColor || "#ffffff"} onChange={(e) => updateData({ primaryButtonColor: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Texto Botão Primário</Label>
                    <Input type="color" value={heroData.primaryButtonTextColor || "#111827"} onChange={(e) => updateData({ primaryButtonTextColor: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Formato dos Botões</Label>
                    <Select value={heroButtonShape} onValueChange={(v) => updateData({ buttonShape: v as "pill" | "square" | "sharp" } as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pill">Arredondado</SelectItem>
                        <SelectItem value="square">Cantos Suaves</SelectItem>
                        <SelectItem value="sharp">Totalmente Quadrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Formato do Badge</Label>
                    <Select value={heroBadgeShape} onValueChange={(v) => updateData({ badgeShape: v as "pill" | "square" | "sharp" } as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pill">Arredondado</SelectItem>
                        <SelectItem value="square">Cantos Suaves</SelectItem>
                        <SelectItem value="sharp">Totalmente Quadrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Controles Serviços
            <div className="space-y-6 pt-4">
               <div className="space-y-4">
                <h3 className="font-bold text-slate-900 border-b pb-2">Conteúdo da Seção</h3>
                <div className="space-y-2">
                  <Label>Título da Seção</Label>
                  <Input value={servicesData.title} onChange={(e) => updateData({ title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo da Seção</Label>
                  <Textarea value={servicesData.subtitle} onChange={(e) => updateData({ subtitle: e.target.value })} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 border-b pb-2">Estilo dos Cards</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fundo do Card</Label>
                    <Input type="color" value={servicesData.cardBgColor || "#ffffff"} onChange={(e) => updateData({ cardBgColor: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor do Ícone</Label>
                    <Input type="color" value={servicesData.cardIconColor || "#000000"} onChange={(e) => updateData({ cardIconColor: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor do Título</Label>
                    <Input type="color" value={servicesData.cardTitleColor || "#000000"} onChange={(e) => updateData({ cardTitleColor: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor da Descrição</Label>
                    <Input type="color" value={servicesData.cardDescriptionColor || "#666666"} onChange={(e) => updateData({ cardDescriptionColor: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between bg-slate-100 px-4 py-2 rounded-t-2xl border-x border-t border-slate-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Desktop Preview (1920x1080)</div>
            <div className="w-10" />
          </div>
          
          <div className="relative aspect-video w-full bg-slate-900 rounded-b-2xl overflow-hidden shadow-2xl border-x border-b border-slate-200">
            {!isServices ? (
              // Preview Hero
              <div 
                className="w-full h-full flex flex-col items-center justify-center p-12 text-center relative"
                style={{ 
                  backgroundColor: heroData.bgColor || "#111827",
                  backgroundImage: heroData.bgType === "image" ? `url(${heroData.bgImage})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              >
                {heroData.bgType === "image" && <div className="absolute inset-0 bg-black/40" />}
                
                <div className="relative z-10 space-y-6 max-w-4xl">
                  <div 
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest",
                      heroBadgeShape === "sharp"
                        ? "rounded-none"
                        : heroBadgeShape === "square"
                          ? "rounded-sm"
                          : "rounded-full"
                    )}
                    style={{ backgroundColor: heroData.badgeColor || "rgba(255,255,255,0.1)", color: heroData.badgeTextColor || "#ffffff" }}
                  >
                    {heroData.badgeIcon && iconMap[heroData.badgeIcon] && (() => {
                      const Icon = iconMap[heroData.badgeIcon];
                      return <Icon className="w-3 h-3" />;
                    })()}
                    {heroData.badge}
                  </div>
                  
                  <h1 
                    className={cn(
                      "font-black leading-[1.1] text-white tracking-tight",
                      heroData.titleSize === "sm" ? "text-4xl" : 
                      heroData.titleSize === "md" ? "text-5xl" : 
                      heroData.titleSize === "lg" ? "text-6xl" : "text-7xl"
                    )}
                  >
                    {heroData.title}
                  </h1>
                  
                  <p className="text-lg text-white/70 max-w-2xl mx-auto font-medium">
                    {heroData.subtitle}
                  </p>
                  
                  <div className="flex gap-4 justify-center pt-4">
                    <Button 
                      size="lg" 
                      className={cn(
                        "px-8 h-12 font-bold",
                        heroButtonShape === "sharp"
                          ? "rounded-none"
                          : heroButtonShape === "square"
                            ? "rounded-sm"
                            : "rounded-full"
                      )}
                      style={{ backgroundColor: heroData.primaryButtonColor || "#ffffff", color: heroData.primaryButtonTextColor || "#111827" }}
                    >
                      {heroData.primaryButton}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className={cn(
                        "px-8 h-12 font-bold text-white border-white hover:bg-white/10 bg-transparent",
                        heroButtonShape === "sharp"
                          ? "rounded-none"
                          : heroButtonShape === "square"
                            ? "rounded-sm"
                            : "rounded-full"
                      )}
                    >
                      {heroData.secondaryButton}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Preview Serviços
              <div className="w-full h-full bg-slate-50 p-12 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-12">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black text-slate-900">{servicesData.title}</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">{servicesData.subtitle}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i}
                        className="p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-4"
                        style={{ backgroundColor: servicesData.cardBgColor || "#ffffff" }}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                          <LayoutGrid className="w-8 h-8" style={{ color: servicesData.cardIconColor || "#000000" }} />
                        </div>
                        <h3 className="text-xl font-bold" style={{ color: servicesData.cardTitleColor || "#000000" }}>Serviço Exemplo {i}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: servicesData.cardDescriptionColor || "#666666" }}>
                          Esta é uma breve descrição de como o seu serviço aparecerá no site.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplatePreviewCard({ 
  template, 
  onPreview, 
  onEditInPlayground,
  onSaveToDb,
  isSaved,
  isSaving
}: { 
  template: HeroTemplatePreset, 
  onPreview: (t: HeroTemplatePreset) => void, 
  onEditInPlayground: (t: HeroTemplatePreset) => void,
  onSaveToDb?: (t: HeroTemplatePreset) => void,
  isSaved?: boolean,
  isSaving?: boolean
}) {
  const [imageError, setImageError] = useState(false);
  const BadgeIcon = template.badgeIcon ? iconMap[template.badgeIcon] : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
      {isSaved && (
        <div className="absolute top-2 right-2 z-20 bg-emerald-500 text-white p-1 rounded-full shadow-lg" title="Salvo no banco">
          <Check className="w-3 h-3" />
        </div>
      )}
      {/* Visual Preview Section */}
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        {(template as any).config?.isCustomHtml ? (
          <div className="absolute inset-0 w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none bg-white z-0">
            <iframe
              title={template.variationName}
              srcDoc={(template as any).config.htmlCode}
              sandbox=""
              className="w-full h-full border-0"
              style={{ overflow: 'hidden' }}
            />
          </div>
        ) : template.bgType === "image" && !imageError ? (
          <>
            <img
              src={template.bgImage}
              alt={template.variationName || template.niche}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/40 z-0" />
          </>
        ) : (
          <div
            className="absolute inset-0 z-0"
            style={{ backgroundColor: template.bgColor || "#111827" }}
          />
        )}

        {/* Hover Overlay - Higher Z-Index and clearer background */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between items-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/75 backdrop-blur-xs z-20">
          <div className="flex flex-col items-center">
            {(template as any).config?.isCustomHtml ? (
              <>
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-2 bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Code2 className="h-3 w-3" />
                  <span>Código Livre</span>
                </div>
                <h4 className="text-white font-bold text-lg line-clamp-2 mb-1">{template.variationName}</h4>
                <p className="text-white/70 text-[10px] line-clamp-2">Template customizado via HTML Lab</p>
              </>
            ) : (
              <>
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-2"
                  style={{
                    backgroundColor: template.badgeColor || "rgba(255,255,255,0.15)",
                    color: template.badgeTextColor || "#ffffff",
                  }}
                >
                  {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
                  <span>{template.badge}</span>
                </div>
                <h4 className="text-white font-bold text-lg line-clamp-2 mb-1">{template.title}</h4>
                <p className="text-white/70 text-[10px] line-clamp-2">{template.subtitle}</p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full max-w-40">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="secondary" 
                className="flex-1 h-8 text-[10px] font-bold rounded-lg"
                onClick={() => onPreview(template)}
              >
                <Eye className="w-3 h-3 mr-1.5" />
                Ver
              </Button>
              <Button 
                size="sm" 
                className="flex-1 h-8 text-[10px] font-bold rounded-lg bg-white text-black hover:bg-white/90"
                onClick={() => onEditInPlayground(template)}
              >
                <Sparkles className="w-3 h-3 mr-1.5" />
                Edit
              </Button>
            </div>
            
            {onSaveToDb && (
              <Button 
                size="sm" 
                variant={isSaved ? "outline" : "default"}
                className={cn(
                  "w-full h-8 text-[10px] font-bold rounded-lg",
                  isSaved ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" : "bg-primary text-primary-foreground"
                )}
                onClick={() => onSaveToDb(template)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                ) : (
                  <Database className="w-3 h-3 mr-1.5" />
                )}
                {isSaved ? "Atualizar no Banco" : "Salvar no Banco"}
              </Button>
            )}
          </div>
        </div>

        {/* Static Content (visible when not hovered) - Lower Z-Index */}
        <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center group-hover:hidden transition-all duration-300 z-10 pointer-events-none">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-4 shadow-sm"
            style={{
              backgroundColor: template.badgeColor || "rgba(255,255,255,0.15)",
              color: template.badgeTextColor || "#ffffff",
            }}
          >
            {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
            <span>{template.badge}</span>
          </div>
          <h4 className="font-black leading-tight text-xl text-white line-clamp-2 drop-shadow-lg">{template.title}</h4>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 bg-white flex flex-col flex-1 border-t">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-slate-900 text-sm">{template.variationName || "Variação"}</h3>
          <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
            {template.niche}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-tighter">ID: {template.id}</p>
          {isSaved && <Badge variant="outline" className="text-[8px] h-4 bg-emerald-50 text-emerald-600 border-emerald-100 px-1">NO BANCO</Badge>}
        </div>
      </div>
    </div>
  );
}

function ServiceTemplatePreviewCard({ 
  template, 
  onPreview, 
  onEditInPlayground,
  onSaveToDb,
  isSaved,
  isSaving
}: { 
  template: ServicesTemplatePreset, 
  onPreview: (t: ServicesTemplatePreset) => void, 
  onEditInPlayground: (t: ServicesTemplatePreset) => void,
  onSaveToDb?: (t: ServicesTemplatePreset) => void,
  isSaved?: boolean,
  isSaving?: boolean
}) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
      {isSaved && (
        <div className="absolute top-2 right-2 z-20 bg-emerald-500 text-white p-1 rounded-full shadow-lg" title="Salvo no banco">
          <Check className="w-3 h-3" />
        </div>
      )}
      {/* Visual Preview Section */}
      <div className="relative aspect-video overflow-hidden bg-slate-100 flex items-center justify-center p-6">
        {(template as any).config?.isCustomHtml ? (
          <div className="absolute inset-0 w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none bg-white z-0">
            <iframe
              title={template.variationName}
              srcDoc={(template as any).config.htmlCode}
              sandbox=""
              className="w-full h-full border-0"
              style={{ overflow: 'hidden' }}
            />
          </div>
        ) : (
          <div 
              className="w-full h-full rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-4"
              style={{ backgroundColor: template.cardBgColor || "#ffffff" }}
          >
            <LayoutGrid 
              className="w-10 h-10 mb-3" 
              style={{ color: template.cardIconColor || "#000000" }}
            />
            <h4 
              className="font-bold text-lg mb-1 line-clamp-1"
              style={{ color: template.cardTitleColor || "#000000" }}
            >
              {template.title}
            </h4>
            <p 
              className="text-xs line-clamp-2"
              style={{ color: template.cardDescriptionColor || "#666666" }}
            >
              {template.subtitle}
            </p>
          </div>
        )}

        {/* Static HTML Badge for Service Card */}
        {(template as any).config?.isCustomHtml && (
          <div className="absolute top-3 left-3 z-10 group-hover:opacity-0 transition-opacity">
            <div className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-sm border border-amber-600/20">
              <Code2 className="h-2.5 w-2.5" />
              <span>HTML</span>
            </div>
          </div>
        )}

        {/* Overlay Info on Hover */}
        <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70 backdrop-blur-xs z-20">
          {(template as any).config?.isCustomHtml && (
             <div className="mb-4">
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-2 bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Code2 className="h-3 w-3" />
                  <span>Código Livre</span>
                </div>
                <h4 className="text-white font-bold text-lg line-clamp-2 mb-1">{template.variationName}</h4>
                <p className="text-white/70 text-[10px] line-clamp-2">Template customizado via HTML Lab</p>
             </div>
          )}
          
          <div className="flex flex-col gap-2 w-full max-w-40">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="secondary" 
                className="flex-1 h-8 text-[10px] font-bold rounded-lg"
                onClick={() => onPreview(template)}
              >
                <Eye className="w-3 h-3 mr-1.5" />
                Ver
              </Button>
              <Button 
                size="sm" 
                className="flex-1 h-8 text-[10px] font-bold rounded-lg bg-white text-black hover:bg-white/90"
                onClick={() => onEditInPlayground(template)}
              >
                <Sparkles className="w-3 h-3 mr-1.5" />
                Edit
              </Button>
            </div>
            {onSaveToDb && (
              <Button 
                size="sm" 
                variant={isSaved ? "outline" : "default"}
                className={cn(
                  "w-full h-8 text-[10px] font-bold rounded-lg",
                  isSaved ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" : "bg-primary text-primary-foreground"
                )}
                onClick={() => onSaveToDb(template)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                ) : (
                  <Database className="w-3 h-3 mr-1.5" />
                )}
                {isSaved ? "Atualizar no Banco" : "Salvar no Banco"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 bg-white flex flex-col flex-1 border-t">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-slate-900 text-sm">{template.variationName || "Variação"}</h3>
          <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
            {template.niche}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-tighter">ID: {template.id}</p>
          {isSaved && <Badge variant="outline" className="text-[8px] h-4 bg-emerald-50 text-emerald-600 border-emerald-100 px-1">NO BANCO</Badge>}
        </div>
      </div>
    </div>
  );
}

export default function MasterTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"banner" | "servicos" | "sobre">("banner");
  const [selectedNiche, setSelectedNiche] = useState("Todos");
  const [selectedTemplate, setSelectedTemplate] = useState<HeroTemplatePreset | ServicesTemplatePreset | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [dbTemplates, setDbTemplates] = useState<MasterTemplatesResponse>({
    banner: [],
    servicos: [],
    historia: [],
    equipe: [],
  });
  const [viewMode, setViewMode] = useState<"gallery" | "playground" | "html-lab">("gallery");
  const [filterSource, setFilterSource] = useState<"all" | "database" | "html-lab">("all");
  const [playgroundData, setPlaygroundData] = useState<HeroTemplatePreset | ServicesTemplatePreset | null>(null);
  const [savingTemplateId, setSavingTemplateId] = useState<string | null>(null);

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    setTemplatesError(null);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/templates`,
        { credentials: "include" },
      );

      if (!response.ok) {
        throw new Error(`Falha ao carregar templates (${response.status})`);
      }

      const data = await response.json();
      setDbTemplates({
        banner: Array.isArray(data?.banner) ? data.banner : [],
        servicos: Array.isArray(data?.servicos) ? data.servicos : [],
        historia: Array.isArray(data?.historia) ? data.historia : [],
        equipe: Array.isArray(data?.equipe) ? data.equipe : [],
      });
    } catch (error) {
      console.error("Erro ao carregar templates do banco:", error);
      setTemplatesError("Não foi possível carregar os templates do banco.");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const templatesData = useMemo(() => {
    // Mesclar Banner garantindo unicidade por ID (Evita erro de Duplicate Key no React)
    const bannerMap = new Map();
    
    // Database templates têm precedência
    dbTemplates.banner.forEach(t => {
      if (t.id && !bannerMap.has(t.id)) {
        bannerMap.set(t.id, t);
      }
    });
    
    // Seed templates completam a lista
    homeHeroTemplates.forEach(t => {
      if (t.id && !bannerMap.has(t.id)) {
        bannerMap.set(t.id, t);
      }
    });

    const mergedBanner = Array.from(bannerMap.values());

    // Mesclar Serviços garantindo unicidade por ID
    const servicosMap = new Map();
    
    dbTemplates.servicos.forEach(t => {
      if (t.id && !servicosMap.has(t.id)) {
        servicosMap.set(t.id, t);
      }
    });
    
    homeServicesTemplates.forEach((t: ServicesTemplatePreset) => {
      if (t.id && !servicosMap.has(t.id)) {
        servicosMap.set(t.id, t);
      }
    });

    const mergedServicos = Array.from(servicosMap.values());

    return {
      banner: mergedBanner,
      servicos: mergedServicos,
      historia: dbTemplates.historia,
      equipe: dbTemplates.equipe,
    };
  }, [dbTemplates]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSaveToDb = async (
    template: HeroTemplatePreset | ServicesTemplatePreset,
    sectionType: "banner" | "servicos",
  ) => {
    setSavingTemplateId(template.id);
    try {
      const payload = {
        templateId: "template_1",
        variationKey: template.id,
        variationName: template.variationName || template.niche,
        niche: template.niche,
        sectionType,
        config: template,
      };

      const response = await customFetch(`${API_BASE_URL}/api/admin/master/templates`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar template (${response.status})`);
      }

      toast.success(`${payload.variationName} salvo no banco com sucesso!`);
      await loadTemplates();
    } catch (error) {
      console.error("Erro ao salvar template no banco:", error);
      toast.error("Falha ao salvar template no banco de dados.");
    } finally {
      setSavingTemplateId(null);
    }
  };

  const niches = useMemo(() => {
    const allNiches = new Set(["Todos"]);
    templatesData.banner.forEach(t => allNiches.add(t.niche));
    templatesData.servicos.forEach(t => allNiches.add(t.niche));
    return Array.from(allNiches);
  }, [templatesData]);

  const filteredTemplates = useMemo(() => {
    const currentList = activeTab === "banner" ? templatesData.banner : templatesData.servicos;
    return currentList.filter(t => {
      const matchesSearch = 
        (t.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (t.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.variationName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.niche || "").toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesNiche = selectedNiche === "Todos" || t.niche === selectedNiche;
      
      const isSaved = (activeTab === "banner" ? dbTemplates.banner : dbTemplates.servicos)
        .some(dbT => dbT.id === t.id);
      const isCustomHtml = (t as any).config?.isCustomHtml;

      const matchesSource = 
        filterSource === "all" || 
        (filterSource === "database" && isSaved) ||
        (filterSource === "html-lab" && isCustomHtml);

      return matchesSearch && matchesNiche && matchesSource;
    });
  }, [activeTab, templatesData, searchTerm, selectedNiche, filterSource, dbTemplates]);

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Templates do Sistema</h1>
              <p className="text-slate-500 font-medium">Gerencie e visualize as variações de layouts disponíveis para os sites.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant={viewMode === "gallery" ? "default" : "outline"}
                className={cn("rounded-full px-6 font-bold", viewMode === "gallery" && "shadow-lg shadow-primary/20")}
                onClick={() => setViewMode("gallery")}
              >
                Galeria
              </Button>
              <Button 
                variant={viewMode === "playground" ? "default" : "outline"}
                className={cn("rounded-full px-6 font-bold", viewMode === "playground" && "shadow-lg shadow-primary/20")}
                onClick={() => setViewMode("playground")}
              >
                Playground
              </Button>
              <Button
                variant={viewMode === "html-lab" ? "default" : "outline"}
                className={cn("rounded-full px-6 font-bold", viewMode === "html-lab" && "shadow-lg shadow-primary/20")}
                onClick={() => setViewMode("html-lab")}
              >
                HTML Lab
              </Button>
            </div>
          </div>

          {viewMode === "gallery" && (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Buscar por título, ID ou variação..." 
                  className="pl-11 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
                  <button
                    onClick={() => setFilterSource("all")}
                    className={cn(
                      "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                      filterSource === "all" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterSource("database")}
                    className={cn(
                      "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2",
                      filterSource === "database" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <Database className="w-3 h-3" />
                    Banco
                  </button>
                  <button
                    onClick={() => setFilterSource("html-lab")}
                    className={cn(
                      "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2",
                      filterSource === "html-lab" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <Code2 className="w-3 h-3" />
                    Lab
                  </button>
                </div>

                <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                  <SelectTrigger className="w-40 rounded-2xl h-12 border-slate-200 bg-slate-50/50 shrink-0">
                    <Filter className="w-4 h-4 mr-2 text-slate-400" />
                    <SelectValue placeholder="Nicho" />
                  </SelectTrigger>
                  <SelectContent>
                    {niches.map(niche => (
                      <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className={cn(
          "mx-auto space-y-8 transition-all duration-500",
          viewMode === "html-lab" ? "max-w-[98%]" : "max-w-7xl"
        )}>
          {viewMode === "playground" ? (
            <TemplatePlayground 
              initialData={playgroundData} 
              onClose={() => {
                setViewMode("gallery");
                setPlaygroundData(null);
              }} 
            />
          ) : viewMode === "html-lab" ? (
            <HtmlThemeLab onSaveSuccess={loadTemplates} />
          ) : (
            <Tabs defaultValue="banner" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-slate-100 p-1 rounded-xl h-auto">
                  <TabsTrigger value="banner" className="rounded-lg py-2 px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">
                    Banner Principal ({templatesData.banner.length})
                  </TabsTrigger>
                  <TabsTrigger value="servicos" className="rounded-lg py-2 px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">
                    Nossos Serviços ({templatesData.servicos.length})
                  </TabsTrigger>
                  <TabsTrigger value="sobre" className="rounded-lg py-2 px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">
                    Páginas Internas ({templatesData.historia.length + templatesData.equipe.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="banner" className="mt-0">
                {isLoadingTemplates ? (
                  <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
                    <p className="text-sm text-slate-500">Carregando templates do banco...</p>
                  </div>
                ) : templatesError ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-red-200 text-center">
                    <h3 className="text-lg font-bold text-slate-900">Falha ao carregar</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">{templatesError}</p>
                  </div>
                ) : filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTemplates.map((template) => (
                      <TemplatePreviewCard 
                        key={template.id} 
                        template={template as HeroTemplatePreset} 
                        onPreview={(t) => setSelectedTemplate(t)}
                        onEditInPlayground={(t) => {
                          setPlaygroundData(t);
                          setViewMode("playground");
                        }}
                        onSaveToDb={(t) => handleSaveToDb(t, "banner")}
                        isSaved={dbTemplates.banner.some((dbTemplate) => dbTemplate.id === template.id)}
                        isSaving={savingTemplateId === template.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Nenhum template encontrado</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                      Não encontramos nenhum template para "{searchTerm}" no nicho "{selectedNiche}".
                    </p>
                    <Button 
                      variant="link" 
                      className="mt-4 text-primary font-bold"
                      onClick={() => { setSearchTerm(""); setSelectedNiche("Todos"); }}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                )}
              </TabsContent>
            
            <TabsContent value="servicos" className="mt-0">
              {isLoadingTemplates ? (
                <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
                  <p className="text-sm text-slate-500">Carregando templates do banco...</p>
                </div>
              ) : templatesError ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-red-200 text-center">
                  <h3 className="text-lg font-bold text-slate-900">Falha ao carregar</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">{templatesError}</p>
                </div>
              ) : filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map((template) => (
                    <ServiceTemplatePreviewCard 
                      key={template.id} 
                      template={template as ServicesTemplatePreset} 
                      onPreview={(t) => setSelectedTemplate(t)}
                      onEditInPlayground={(t) => {
                        setPlaygroundData(t);
                        setViewMode("playground");
                      }}
                      onSaveToDb={(t) => handleSaveToDb(t, "servicos")}
                      isSaved={dbTemplates.servicos.some((dbTemplate) => dbTemplate.id === template.id)}
                      isSaving={savingTemplateId === template.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Nenhum template encontrado</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                    Não encontramos nenhum template para "{searchTerm}" no nicho "{selectedNiche}".
                  </p>
                  <Button 
                    variant="link" 
                    className="mt-4 text-primary font-bold"
                    onClick={() => { setSearchTerm(""); setSelectedNiche("Todos"); }}
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sobre" className="mt-0">
              {isLoadingTemplates ? (
                <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
                  <p className="text-sm text-slate-500">Carregando templates do banco...</p>
                </div>
              ) : templatesError ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-red-200 text-center">
                  <h3 className="text-lg font-bold text-slate-900">Falha ao carregar</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">{templatesError}</p>
                </div>
              ) : filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map((template) => (
                    <TemplatePreviewCard 
                      key={template.id} 
                      template={template as HeroTemplatePreset} 
                      onPreview={(t) => setSelectedTemplate(t)}
                      onEditInPlayground={(t) => {
                        setPlaygroundData(t);
                        setViewMode("playground");
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Nenhum template encontrado</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                    Não encontramos nenhum template para "{searchTerm}" no nicho "{selectedNiche}".
                  </p>
                  <Button 
                    variant="link" 
                    className="mt-4 text-primary font-bold"
                    onClick={() => { setSearchTerm(""); setSelectedNiche("Todos"); }}
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto p-0 border-none bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Visualização do Template</DialogTitle>
            <DialogDescription>Visualização em tela cheia do template selecionado.</DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="relative w-full min-h-[70vh] flex flex-col">
              {/* Template Render Logic */}
              {(selectedTemplate as any).config?.isCustomHtml ? (
                <div className="flex-1 bg-white relative min-h-[60vh] overflow-hidden">
                  <iframe
                    title={selectedTemplate.variationName}
                    srcDoc={(selectedTemplate as any).config.htmlCode}
                    className="w-full h-full border-0 absolute inset-0"
                    style={{ minHeight: '60vh' }}
                  />
                </div>
              ) : 'bgType' in selectedTemplate ? (
                <div 
                  className="flex-1 flex flex-col items-center justify-center p-20 relative overflow-hidden"
                  style={{ 
                    backgroundColor: (selectedTemplate as HeroTemplatePreset).bgColor || '#111827',
                    backgroundImage: (selectedTemplate as HeroTemplatePreset).bgType === 'image' ? `url(${(selectedTemplate as HeroTemplatePreset).bgImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {(selectedTemplate as HeroTemplatePreset).bgType === 'image' && (
                    <div 
                      className="absolute inset-0 bg-black/50" 
                      style={{ opacity: (selectedTemplate as HeroTemplatePreset).overlayOpacity ?? 0.5 }}
                    />
                  )}
                  
                  <div className="relative z-10 max-w-5xl w-full text-center space-y-8">
                    <div 
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                      style={{ 
                        backgroundColor: (selectedTemplate as HeroTemplatePreset).badgeColor || 'rgba(255,255,255,0.1)',
                        color: (selectedTemplate as HeroTemplatePreset).badgeTextColor || '#ffffff'
                      }}
                    >
                      {(selectedTemplate as HeroTemplatePreset).badgeIcon && iconMap[(selectedTemplate as HeroTemplatePreset).badgeIcon as string] && (
                        (() => {
                          const Icon = iconMap[(selectedTemplate as HeroTemplatePreset).badgeIcon as string];
                          return <Icon className="w-4 h-4" />;
                        })()
                      )}
                      {(selectedTemplate as HeroTemplatePreset).badge}
                    </div>
                    
                    <h2 
                      className={cn(
                        "font-bold leading-[1.05] tracking-tight text-white max-w-4xl mx-auto",
                        (selectedTemplate as HeroTemplatePreset).titleSize === 'sm' ? "text-5xl" :
                        (selectedTemplate as HeroTemplatePreset).titleSize === 'md' ? "text-6xl" :
                        (selectedTemplate as HeroTemplatePreset).titleSize === 'lg' ? "text-7xl" :
                        "text-8xl"
                      )}
                    >
                      {(selectedTemplate as HeroTemplatePreset).title}
                    </h2>
                    
                    <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                      {(selectedTemplate as HeroTemplatePreset).subtitle}
                    </p>
                    
                    <div className="flex justify-center gap-6 pt-10">
                      <Button 
                        size="lg" 
                        className="rounded-full px-10 h-16 font-bold text-xl"
                        style={{ 
                          backgroundColor: (selectedTemplate as HeroTemplatePreset).primaryButtonTransparent ? 'transparent' : ((selectedTemplate as HeroTemplatePreset).primaryButtonColor || '#ffffff'),
                          color: (selectedTemplate as HeroTemplatePreset).primaryButtonTransparent ? ((selectedTemplate as HeroTemplatePreset).primaryButtonColor || '#ffffff') : ((selectedTemplate as HeroTemplatePreset).primaryButtonTextColor || '#111827'),
                          border: `2px solid ${(selectedTemplate as HeroTemplatePreset).primaryButtonColor || '#ffffff'}`
                        }}
                      >
                        {(selectedTemplate as HeroTemplatePreset).primaryButton}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="rounded-full px-10 h-16 font-bold text-xl border-2"
                        style={{ 
                          backgroundColor: (selectedTemplate as HeroTemplatePreset).secondaryButtonTransparent ? 'transparent' : ((selectedTemplate as HeroTemplatePreset).secondaryButtonColor || 'transparent'),
                          color: (selectedTemplate as HeroTemplatePreset).secondaryButtonColor || '#ffffff',
                          borderColor: (selectedTemplate as HeroTemplatePreset).secondaryButtonColor || '#ffffff'
                        }}
                      >
                        {(selectedTemplate as HeroTemplatePreset).secondaryButton}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-white p-8 sm:p-20 flex items-center justify-center">
                   <div 
                    className="max-w-md w-full aspect-square rounded-[2rem] shadow-2xl flex flex-col items-center justify-center text-center p-12 border-4 border-slate-100"
                    style={{ backgroundColor: (selectedTemplate as ServicesTemplatePreset).cardBgColor || "#ffffff" }}
                   >
                      <div 
                        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8"
                        style={{ backgroundColor: `${(selectedTemplate as ServicesTemplatePreset).cardIconColor}15` || "#f1f5f9" }}
                      >
                        <LayoutGrid 
                          className="w-12 h-12" 
                          style={{ color: (selectedTemplate as ServicesTemplatePreset).cardIconColor || "#000000" }}
                        />
                      </div>
                      <h3 
                        className="text-3xl font-bold mb-4"
                        style={{ color: (selectedTemplate as ServicesTemplatePreset).cardTitleColor || "#000000" }}
                      >
                        {(selectedTemplate as ServicesTemplatePreset).title}
                      </h3>
                      <p 
                        className="text-lg leading-relaxed"
                        style={{ color: (selectedTemplate as ServicesTemplatePreset).cardDescriptionColor || "#64748b" }}
                      >
                        {(selectedTemplate as ServicesTemplatePreset).subtitle}
                      </p>
                   </div>
                </div>
              )}
              
              <div className="bg-black/20 backdrop-blur-md p-6 flex items-center justify-between border-t border-white/10">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                     {selectedTemplate.niche.charAt(0)}
                   </div>
                   <div>
                     <p className="text-sm font-bold">{selectedTemplate.variationName || 'Layout de Sistema'}</p>
                     <p className="text-[10px] text-white/50 uppercase tracking-widest">{selectedTemplate.niche}</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-white/20 text-white/70">ID: {selectedTemplate.id}</Badge>
                  <Button 
                    size="sm" 
                    className="bg-white text-black hover:bg-white/90 font-bold rounded-full"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Fechar Visualização
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
