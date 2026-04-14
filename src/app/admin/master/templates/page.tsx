"use client";

import { LayoutGrid, Search, Filter, Eye, Sparkles } from "lucide-react";
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
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/auth-client";

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
  historia: HeroTemplatePreset[];
  equipe: HeroTemplatePreset[];
}

function TemplatePreviewCard({ template, onPreview }: { template: HeroTemplatePreset, onPreview: (t: HeroTemplatePreset) => void }) {
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

        <div className="absolute inset-0 p-6 flex flex-col justify-between items-center text-center">
          <div className="flex flex-col items-center">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: template.badgeColor || "rgba(255,255,255,0.15)",
                color: template.badgeTextColor || "#ffffff",
              }}
            >
              {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
              <span>{template.badge}</span>
            </div>
            
            <h4
              className="mt-4 font-bold leading-tight text-xl sm:text-2xl text-white line-clamp-2"
            >
              {template.title}
            </h4>
            
            <p className="mt-2 text-xs text-white/80 line-clamp-2 max-w-62.5">
              {template.subtitle}
            </p>
          </div>

          <div className="flex gap-3 mt-4">
            <div
              className="px-4 py-1.5 rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: template.primaryButtonTransparent ? "transparent" : (template.primaryButtonColor || "#ffffff"),
                border: `1px solid ${template.primaryButtonColor || "#ffffff"}`,
                color: template.primaryButtonTransparent ? (template.primaryButtonColor || "#ffffff") : (template.primaryButtonTextColor || "#111827"),
              }}
            >
              {template.primaryButton}
            </div>
          </div>
        </div>
        
        {/* Overlay Info on Hover */}
        <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 text-white">
            <div className="text-center space-y-4">
                <p className="text-sm font-medium">Detalhes Técnicos</p>
                <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="bg-white/10 border-white/20 text-white text-[10px]">Fonte: {template.fontFamily || 'Padrão'}</Badge>
                    <Badge variant="outline" className="bg-white/10 border-white/20 text-white text-[10px]">Tamanho: {template.titleSize || 'MD'}</Badge>
                    <Badge variant="outline" className="bg-white/10 border-white/20 text-white text-[10px]">BG: {template.bgType}</Badge>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="mt-2 rounded-full font-bold"
                  onClick={() => onPreview(template)}
                >
                    <Eye className="w-4 h-4 mr-2" /> Visualizar Cheio
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

function ServiceTemplatePreviewCard({ template, onPreview }: { template: ServicesTemplatePreset, onPreview: (t: ServicesTemplatePreset) => void }) {
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
        <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 text-white">
            <div className="text-center space-y-4">
                <p className="text-sm font-medium">Layout de Serviços</p>
                <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="bg-white/10 border-white/20 text-white text-[10px]">ID: {template.id}</Badge>
                    <Badge variant="outline" className="bg-white/10 border-white/20 text-white text-[10px]">Nicho: {template.niche}</Badge>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="mt-2 rounded-full font-bold"
                  onClick={() => onPreview(template)}
                >
                    <Eye className="w-4 h-4 mr-2" /> Ver Detalhes
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
  const [activeTab, setActiveTab] = useState("banner");
  const [selectedNiche, setSelectedNiche] = useState("Todos");
  const [selectedTemplate, setSelectedTemplate] = useState<HeroTemplatePreset | ServicesTemplatePreset | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [templatesData, setTemplatesData] = useState<MasterTemplatesResponse>({
    banner: [],
    servicos: [],
    historia: [],
    equipe: [],
  });

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
        setTemplatesData({
          banner: Array.isArray(data?.banner) ? data.banner : [],
          servicos: Array.isArray(data?.servicos) ? data.servicos : [],
          historia: Array.isArray(data?.historia) ? data.historia : [],
          equipe: Array.isArray(data?.equipe) ? data.equipe : [],
        });
      } catch (error) {
        setTemplatesError("Não foi possível carregar os templates do banco.");
        setTemplatesData({
          banner: [],
          servicos: [],
          historia: [],
          equipe: [],
        });
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, []);

  const niches = useMemo(() => {
    const allTemplates = [
      ...templatesData.banner,
      ...templatesData.servicos,
      ...templatesData.historia,
      ...templatesData.equipe,
    ];
    const uniqueNiches = Array.from(new Set(allTemplates.map(t => t.niche)));
    return ["Todos", ...uniqueNiches.sort()];
  }, [templatesData]);

  const filteredTemplates = useMemo(() => {
    let currentTemplates: (HeroTemplatePreset | ServicesTemplatePreset)[] = [];
    
    if (activeTab === "banner") currentTemplates = templatesData.banner;
    else if (activeTab === "servicos") currentTemplates = templatesData.servicos;
    else if (activeTab === "sobre") currentTemplates = [...templatesData.historia, ...templatesData.equipe];

    return currentTemplates.filter(t => {
      const matchesSearch = 
        t.niche.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (t.variationName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesNiche = selectedNiche === "Todos" || t.niche === selectedNiche;
      
      return matchesSearch && matchesNiche;
    });
  }, [searchTerm, selectedNiche, activeTab, templatesData]);

  const totalTemplates = useMemo(() => {
      return (
        templatesData.banner.length +
        templatesData.servicos.length +
        templatesData.historia.length +
        templatesData.equipe.length
      );
  }, [templatesData]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50">
      {/* Header Section */}
      <div className="bg-white border-b px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold mb-1">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm uppercase tracking-widest">Biblioteca Global</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gerenciamento de Templates</h1>
            <p className="text-slate-500 text-sm max-w-2xl">
              Visualize, organize e gerencie todos os templates visuais disponíveis para as landing pages do sistema.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-primary/5 border border-primary/10 px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Total de Templates</p>
                <p className="text-xl font-black text-primary leading-none mt-1">{totalTemplates}</p>
              </div>
              <LayoutGrid className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nicho, variação ou ID..." 
              className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              {niches.slice(0, 6).map(niche => (
                <button
                  key={niche}
                  onClick={() => setSelectedNiche(niche)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                    selectedNiche === niche 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {niche}
                </button>
              ))}
              {niches.length > 6 && (
                <div className="px-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Tabs defaultValue="banner" className="w-full" onValueChange={setActiveTab}>
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
                // Render Hero Template
                <div 
                  className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 relative overflow-hidden"
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
                  
                  <div className="relative z-10 max-w-4xl w-full text-center space-y-6">
                    <div 
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
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
                        "font-bold leading-[1.1] tracking-tight text-white",
                        (selectedTemplate as HeroTemplatePreset).titleSize === 'sm' ? "text-4xl sm:text-5xl" :
                        (selectedTemplate as HeroTemplatePreset).titleSize === 'md' ? "text-5xl sm:text-7xl" :
                        (selectedTemplate as HeroTemplatePreset).titleSize === 'lg' ? "text-6xl sm:text-8xl" :
                        "text-7xl sm:text-9xl"
                      )}
                    >
                      {(selectedTemplate as HeroTemplatePreset).title}
                    </h2>
                    
                    <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                      {(selectedTemplate as HeroTemplatePreset).subtitle}
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4 pt-8">
                      <Button 
                        size="lg" 
                        className="rounded-full px-8 h-14 font-bold text-lg"
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
                        className="rounded-full px-8 h-14 font-bold text-lg border-2"
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
                // Render Service Template Preview
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
              
              {/* Footer Info */}
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
