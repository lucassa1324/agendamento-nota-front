"use client";

import { LayoutGrid, Search, Filter, Eye, Sparkles, Home, Image as ImageIcon, Calendar, Users, Maximize2, Code2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
    name: "Inicio",
    icon: Home,
    subsections: [
      { id: "hero", name: "Hero (Banner Principal)" },
      { id: "services", name: "Servicos" },
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
    name: "Sobre Nos",
    icon: Users,
    subsections: [{ id: "about-hero", name: "Hero Sobre" }],
  },
];

const htmlLabSeedThemes: HtmlThemeTemplate[] = [
  {
    id: "html-hero-elegante",
    niche: "Studio de Sobrancelha",
    section: "home",
    subsection: "hero",
    variationName: "Elegante e Minimalista",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,Arial;background:linear-gradient(135deg,#111827,#1f2937);color:#fff}.wrap{height:100vh;display:flex;align-items:center;justify-content:center;padding:48px;text-align:center}.badge{display:inline-block;padding:8px 14px;border-radius:999px;background:#ffffff22;font-size:12px;letter-spacing:.08em;text-transform:uppercase}.title{font-size:56px;line-height:1.05;margin:18px 0 10px;font-weight:900}.sub{max-width:760px;margin:0 auto 30px;color:#e5e7eb}.btn{display:inline-block;padding:14px 26px;border-radius:999px;font-weight:700;text-decoration:none}.btn-a{background:#fff;color:#111827}.btn-b{border:2px solid #fff;color:#fff;margin-left:12px}</style></head><body><section class="wrap"><div><span class="badge">Design Premium</span><h1 class="title">Olhar marcante e natural</h1><p class="sub">Teste de tema em HTML puro para validação offline antes de publicar.</p><a class="btn btn-a" href="#">Agendar Agora</a><a class="btn btn-b" href="#">Ver Galeria</a></div></section></body></html>`,
  },
  {
    id: "html-hero-vibrante",
    niche: "Manicure e Pedicure",
    section: "home",
    subsection: "hero",
    variationName: "Moderno e Vibrante",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Poppins,Arial;background:#09090b;color:#fafafa}.hero{height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 20% 20%,#ec489955,transparent 40%),radial-gradient(circle at 80% 20%,#22d3ee55,transparent 40%),#09090b}.box{max-width:920px;text-align:center;padding:40px}.kicker{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#f472b6}.title{font-size:58px;line-height:1.02;font-weight:900;margin:12px 0 14px}.sub{color:#d4d4d8;max-width:700px;margin:0 auto 28px}.cta{background:#f472b6;color:#111827;padding:14px 28px;border-radius:999px;font-weight:800;text-decoration:none;display:inline-block}</style></head><body><section class="hero"><div class="box"><div class="kicker">Nova Tendencia</div><h1 class="title">Transforme seu visual hoje</h1><p class="sub">Variações em HTML podem ser geradas e testadas sem impactar o site online.</p><a class="cta" href="#">Quero Agendar</a></div></section></body></html>`,
  },
  {
    id: "html-gallery-grid",
    niche: "Clinicas em Geral",
    section: "gallery",
    subsection: "gallery-grid",
    variationName: "Grid Clean",
    html: `<!doctype html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:Inter,Arial;background:#f8fafc;color:#0f172a}.wrap{padding:48px}.title{font-size:34px;font-weight:900;margin:0 0 24px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.item{background:#fff;border-radius:18px;padding-top:70%;position:relative;overflow:hidden;border:1px solid #e2e8f0}.item span{position:absolute;left:12px;bottom:10px;background:#0f172a;color:#fff;font-size:12px;padding:6px 10px;border-radius:999px}</style></head><body><main class="wrap"><h1 class="title">Galeria de Resultados</h1><section class="grid"><article class="item"><span>Design 1</span></article><article class="item"><span>Design 2</span></article><article class="item"><span>Design 3</span></article><article class="item"><span>Design 4</span></article><article class="item"><span>Design 5</span></article><article class="item"><span>Design 6</span></article></section></main></body></html>`,
  },
];

function HtmlThemeLab() {
  const [activeMainSection, setActiveMainSection] = useState<HtmlLabMainSection>("home");
  const [activeSubsection, setActiveSubsection] = useState("hero");
  const [selectedNiche, setSelectedNiche] = useState("Todos");
  const [themes, setThemes] = useState<HtmlThemeTemplate[]>(htmlLabSeedThemes);
  const [selectedThemeId, setSelectedThemeId] = useState(htmlLabSeedThemes[0]?.id ?? "");
  const [htmlDraft, setHtmlDraft] = useState(htmlLabSeedThemes[0]?.html ?? "");
  const [previewTheme, setPreviewTheme] = useState<HtmlThemeTemplate | null>(null);

  const uniqueNiches = useMemo(
    () => ["Todos", ...Array.from(new Set(themes.map((t) => t.niche)))],
    [themes]
  );

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
    <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <aside className="xl:col-span-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Secoes do site base</p>
            <div className="space-y-3">
              {htmlLabSections.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === activeMainSection;
                return (
                  <div key={section.id} className="space-y-1">
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn("w-full justify-start gap-2", isActive && "font-bold")}
                      onClick={() => {
                        setActiveMainSection(section.id);
                        setActiveSubsection(section.subsections[0].id);
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {section.name}
                    </Button>
                    {isActive && (
                      <div className="pl-4 border-l-2 border-slate-200 space-y-1">
                        {section.subsections.map((sub) => (
                          <button
                            key={sub.id}
                            className={cn(
                              "w-full text-left text-xs rounded-md px-2 py-1.5 transition-colors",
                              activeSubsection === sub.id
                                ? "bg-primary text-white font-semibold"
                                : "text-slate-600 hover:bg-slate-200"
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

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Selecione o nicho</p>
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {uniqueNiches.map((niche) => (
                <button
                  key={niche}
                  className={cn(
                    "w-full text-left text-xs rounded-md px-3 py-2 border transition-colors",
                    selectedNiche === niche
                      ? "border-primary/30 bg-primary/10 text-primary font-semibold"
                      : "border-transparent hover:bg-slate-100 text-slate-600"
                  )}
                  onClick={() => setSelectedNiche(niche)}
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="xl:col-span-9 space-y-5">
          <div className="rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">Visualizando exemplo</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {htmlLabSections.find((s) => s.id === activeMainSection)?.subsections.find((sub) => sub.id === activeSubsection)?.name}
              </h3>
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              {filteredThemes.length} variacoes disponiveis
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredThemes.length > 0 ? (
              filteredThemes.map((theme) => (
                <div key={theme.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                  <div className="relative aspect-video bg-slate-900">
                    <iframe
                      title={theme.variationName}
                      srcDoc={theme.html}
                      sandbox=""
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    />
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-black/50 flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setPreviewTheme(theme)}>
                        <Maximize2 className="w-3 h-3 mr-1" />
                        Ampliar
                      </Button>
                      <Button size="sm" onClick={() => setSelectedThemeId(theme.id)}>
                        <Code2 className="w-3 h-3 mr-1" />
                        Editar HTML
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-slate-900">{theme.variationName}</p>
                    <p className="text-[11px] text-slate-500">{theme.niche}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                <p className="text-sm text-slate-500">Nenhum tema HTML para essa secao/nicho. Crie uma variacao abaixo.</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-900">Editor HTML Offline</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={createNewVariation}>Nova Variacao</Button>
                <Button size="sm" onClick={applyHtmlChanges}>Aplicar no Tema Selecionado</Button>
              </div>
            </div>
            <Textarea
              value={htmlDraft}
              onChange={(e) => setHtmlDraft(e.target.value)}
              className="min-h-64 font-mono text-xs"
              placeholder="Cole aqui o HTML puro da variacao..."
            />
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-3 py-2 bg-slate-100 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                Preview Local (srcDoc)
              </div>
              <div className="relative aspect-video bg-white">
                <iframe
                  title="preview-local-html"
                  srcDoc={htmlDraft}
                  sandbox=""
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!previewTheme} onOpenChange={(open) => !open && setPreviewTheme(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Preview do tema HTML</DialogTitle>
            <DialogDescription>Visualizacao local do tema em HTML puro.</DialogDescription>
          </DialogHeader>
          {previewTheme && (
            <iframe
              title={previewTheme.variationName}
              srcDoc={previewTheme.html}
              sandbox=""
              className="w-full h-full border-0"
            />
          )}
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
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
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
                      className="rounded-full px-8 h-12 font-bold"
                      style={{ backgroundColor: heroData.primaryButtonColor || "#ffffff", color: heroData.primaryButtonTextColor || "#111827" }}
                    >
                      {heroData.primaryButton}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="rounded-full px-8 h-12 font-bold text-white border-white hover:bg-white/10 bg-transparent"
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

function TemplatePreviewCard({ template, onPreview, onEditInPlayground }: { template: HeroTemplatePreset, onPreview: (t: HeroTemplatePreset) => void, onEditInPlayground: (t: HeroTemplatePreset) => void }) {
  const [imageError, setImageError] = useState(false);
  const BadgeIcon = template.badgeIcon ? iconMap[template.badgeIcon] : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Visual Preview Section */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
        {template.bgType === "image" && !imageError ? (
          <>
            <img
              src={template.bgImage}
              alt={template.variationName || template.niche}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: template.bgColor || "#111827" }}
          />
        )}

        <div className="absolute inset-0 p-6 flex flex-col justify-between items-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-[2px]">
          <div className="flex flex-col items-center">
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
          </div>

          <div className="flex flex-col gap-2 w-full max-w-40">
            <Button 
              size="sm" 
              variant="secondary" 
              className="w-full h-8 text-[10px] font-bold rounded-lg"
              onClick={() => onPreview(template)}
            >
              <Eye className="w-3 h-3 mr-1.5" />
              Visualizar
            </Button>
            <Button 
              size="sm" 
              className="w-full h-8 text-[10px] font-bold rounded-lg bg-white text-black hover:bg-white/90"
              onClick={() => onEditInPlayground(template)}
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              Playground
            </Button>
          </div>
        </div>

        {/* Static Content (visible when not hovered) */}
        <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center group-hover:hidden transition-all duration-300">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-4"
            style={{
              backgroundColor: template.badgeColor || "rgba(255,255,255,0.15)",
              color: template.badgeTextColor || "#ffffff",
            }}
          >
            {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
            <span>{template.badge}</span>
          </div>
          <h4 className="font-bold leading-tight text-xl text-white line-clamp-2">{template.title}</h4>
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
        <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-tighter">ID: {template.id}</p>
      </div>
    </div>
  );
}

function ServiceTemplatePreviewCard({ template, onPreview, onEditInPlayground }: { template: ServicesTemplatePreset, onPreview: (t: ServicesTemplatePreset) => void, onEditInPlayground: (t: ServicesTemplatePreset) => void }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Visual Preview Section */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100 flex items-center justify-center p-6">
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

        {/* Overlay Info on Hover */}
        <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-[2px]">
          <div className="flex flex-col gap-2 w-full max-w-40">
            <Button 
              size="sm" 
              variant="secondary" 
              className="w-full h-8 text-[10px] font-bold rounded-lg"
              onClick={() => onPreview(template)}
            >
              <Eye className="w-3 h-3 mr-1.5" />
              Visualizar
            </Button>
            <Button 
              size="sm" 
              className="w-full h-8 text-[10px] font-bold rounded-lg bg-white text-black hover:bg-white/90"
              onClick={() => onEditInPlayground(template)}
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              Playground
            </Button>
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
        <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-tighter">ID: {template.id}</p>
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
  const [playgroundData, setPlaygroundData] = useState<HeroTemplatePreset | ServicesTemplatePreset | null>(null);

  const templatesData = useMemo(() => {
    // Mesclar Banner
    const dbBannerIds = new Set(dbTemplates.banner.map(t => t.id));
    const mergedBanner = [
      ...dbTemplates.banner,
      ...homeHeroTemplates.filter(t => !dbBannerIds.has(t.id))
    ];

    // Mesclar Serviços
    const dbServicosIds = new Set(dbTemplates.servicos.map(t => t.id));
    const mergedServicos = [
      ...dbTemplates.servicos,
      ...homeServicesTemplates.filter((t: ServicesTemplatePreset) => !dbServicosIds.has(t.id))
    ];

    return {
      banner: mergedBanner,
      servicos: mergedServicos,
      historia: dbTemplates.historia,
      equipe: dbTemplates.equipe,
    };
  }, [dbTemplates]);

  useEffect(() => {
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

    loadTemplates();
  }, []);

  const niches = useMemo(() => {
    const allNiches = new Set(["Todos"]);
    templatesData.banner.forEach(t => allNiches.add(t.niche));
    templatesData.servicos.forEach(t => allNiches.add(t.niche));
    return Array.from(allNiches);
  }, [templatesData]);

  const filteredTemplates = useMemo(() => {
    const currentList = activeTab === "banner" ? templatesData.banner : templatesData.servicos;
    return currentList.filter(t => {
      const matchesSearch = (t.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.variationName && t.variationName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesNiche = selectedNiche === "Todos" || t.niche === selectedNiche;
      return matchesSearch && matchesNiche;
    });
  }, [activeTab, templatesData, searchTerm, selectedNiche]);

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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Buscar por título, ID ou variação..." 
                  className="pl-11 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                  <SelectTrigger className="w-50 rounded-2xl h-12 border-slate-200 bg-slate-50/50">
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
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {viewMode === "playground" ? (
            <TemplatePlayground 
              initialData={playgroundData} 
              onClose={() => {
                setViewMode("gallery");
                setPlaygroundData(null);
              }} 
            />
          ) : viewMode === "html-lab" ? (
            <HtmlThemeLab />
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
              {'bgType' in selectedTemplate ? (
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
