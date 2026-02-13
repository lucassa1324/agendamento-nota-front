/** biome-ignore-all lint/a11y/useSemanticElements: Elementos de layout complexos para gerenciamento de mídia e arraste */
"use client";

import {
  Home,
  ImageIcon,
  Link as LinkIcon,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/auth-client";
import {
  getServices,
  type Service,
} from "@/lib/booking-data";
import {
  type GalleryItem,
  galleryService,
} from "@/lib/gallery-service";
import { cn } from "@/lib/utils";

export function GalleryManager() {
  const { toast } = useToast();
  const { studio } = useStudio();
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    if (!studio?.id) return;
    
    setIsLoading(true);
    try {
      console.log(">>> [GalleryManager] Carregando dados para studio:", studio.id);
      
      // 1. Carregar imagens da galeria
      const remoteImages = await galleryService.getPublicGallery(studio.id);
      setImages(remoteImages);
      
      // 2. Tentar obter serviços de múltiplas fontes
      let loadedServices: Service[] = [];
      
      // Fonte A: Contexto do Studio (ideal)
      if (studio?.services && studio.services.length > 0) {
        console.log(">>> [GalleryManager] Serviços carregados via StudioContext:", studio.services.length);
        loadedServices = studio.services;
      } 
      // Fonte B: LocalStorage/Legacy fallback
      else {
        const legacyServices = getServices();
        if (legacyServices && legacyServices.length > 0) {
          console.log(">>> [GalleryManager] Serviços carregados via LocalStorage/Fallback:", legacyServices.length);
          loadedServices = legacyServices;
        }
      }

      // Fonte C: API Direta (Fallback final se as outras falharem)
      if (loadedServices.length === 0) {
        console.log(">>> [GalleryManager] Nenhuma fonte local tem serviços. Tentando API direta...");
        try {
          const servicesTimestamp = Date.now();
          const servicesUrl = `${API_BASE_URL}/api/services/company/${studio.id}?t=${servicesTimestamp}`;
          const response = await fetch(servicesUrl);
          if (response.ok) {
            const apiServices = await response.json();
            if (Array.isArray(apiServices) && apiServices.length > 0) {
              console.log(">>> [GalleryManager] Serviços carregados via API direta:", apiServices.length);
              loadedServices = apiServices;
            }
          }
        } catch (apiError) {
          console.error(">>> [GalleryManager] Erro ao buscar serviços via API:", apiError);
        }
      }
        
      setServices(loadedServices);

      if (loadedServices.length > 0 && !categoryInput) {
        setCategoryInput(loadedServices[0].name);
      }
    } catch (error) {
      console.error("Erro ao carregar galeria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as imagens da galeria.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [studio?.id, studio?.services, categoryInput, toast]);

  useEffect(() => {
    loadData();

    window.addEventListener("studioSettingsUpdated", loadData);
    window.addEventListener("servicesUpdated", loadData);
    window.addEventListener("DataReady", loadData);

    return () => {
      window.removeEventListener("studioSettingsUpdated", loadData);
      window.removeEventListener("servicesUpdated", loadData);
      window.removeEventListener("DataReady", loadData);
    };
  }, [loadData]);

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const filteredImages = images.filter((img) => {
    const matchesSearch =
      (img.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || img.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Verificação de segurança: Só prossegue se houver estúdio carregado
    if (!studio?.id) {
      toast({
        title: "Erro de Autenticação",
        description: "Estúdio não identificado. Tente recarregar a página.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (event) => resolve(event.target?.result as string);
        });
        reader.readAsDataURL(file);
        const base64 = await base64Promise;

        await galleryService.create({
          imageUrl: base64,
          title: file.name.split(".")[0],
          category: categoryInput || (services.length > 0 ? services[0].name : "Geral"),
          showInHome: false,
        });
      }
      
      await loadData();
      
      // Notificar Home
      window.dispatchEvent(new Event("galleryUpdated"));

      toast({
        title: "Upload concluído",
        description: `${files.length} imagem(ns) adicionada(s) com sucesso.`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao enviar as imagens.";
      console.error(">>> [GalleryManager] Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddByUrl = async () => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida.",
        variant: "destructive",
      });
      return;
    }

    if (!studio?.id) {
      toast({
        title: "Erro de Autenticação",
        description: "Estúdio não identificado. Tente recarregar a página.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await galleryService.create({
        imageUrl: trimmedUrl,
        title: titleInput || "Sem título",
        category: categoryInput || (services.length > 0 ? services[0].name : "Geral"),
        showInHome: false,
      });

      setUrlInput("");
      setTitleInput("");
      await loadData();

      // Notificar Home
      window.dispatchEvent(new Event("galleryUpdated"));

      toast({
        title: "Sucesso",
        description: "Imagem adicionada à galeria.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Não foi possível adicionar a imagem.";
      console.error(">>> [GalleryManager] Erro ao adicionar via URL:", error);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta imagem?")) return;

    try {
      await galleryService.delete(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
      
      // Notificar Home
      window.dispatchEvent(new Event("galleryUpdated"));

      toast({
        title: "Imagem excluída",
        description: "A imagem foi removida da galeria.",
      });
    } catch (_error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível remover a imagem.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async (id: string, newCategory: string) => {
    try {
      await galleryService.update(id, { category: newCategory });
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, category: newCategory } : img,
        ),
      );
    } catch (_error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive",
      });
    }
  };

  const toggleShowOnHome = async (id: string, currentState: boolean) => {
    try {
      await galleryService.update(id, { showInHome: !currentState });
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, showInHome: !currentState } : img,
        ),
      );

      // Notificar outros componentes (como o Preview da Home) que a galeria mudou
      window.dispatchEvent(new Event("galleryUpdated"));

      toast({
        title: currentState ? "Removida da Home" : "Adicionada à Home",
        description: currentState
          ? "A imagem não aparecerá mais no carrossel inicial."
          : "A imagem agora aparecerá no carrossel inicial.",
      });
    } catch (_error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível alterar o status da imagem.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Gerenciar Galeria</h2>
        <p className="text-muted-foreground text-sm">
          Adicione e organize as fotos dos seus trabalhos. As imagens são
          salvas e sincronizadas com o servidor.
        </p>
      </div>

      <div className="grid gap-6">
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
        {/* Upload Card */}
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">
              Upload de Imagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) =>
                e.key === "Enter" && fileInputRef.current?.click()
              }
              role="button"
              tabIndex={0}
              className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-10 text-center hover:bg-muted/10 transition-colors cursor-pointer group"
            >
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <div className="bg-[#D946EF]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-8 h-8 text-[#D946EF]" />
              </div>
              <p className="text-muted-foreground mb-4">
                Arraste imagens aqui ou clique para selecionar
              </p>
              <Button
                type="button"
                variant="default"
                className="bg-[#D946EF] hover:bg-[#C026D3] text-white rounded-full px-6"
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Enviando..." : "Selecionar Imagens"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* URL Card */}
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Adicionar Imagem via URL
            </CardTitle>
            <CardDescription>
              Cole o link da imagem do Pinterest ou qualquer outra URL de imagem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3 mb-2">
              <div className="text-blue-500 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-400">
                <p className="font-semibold mb-1">
                  Dica para links do Pinterest:
                </p>
                <p>
                  Clique com o botão direito na imagem e selecione{" "}
                  <strong>"Copiar endereço da imagem"</strong>. O link deve
                  terminar em .jpg, .png ou .webp.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="url">URL da Imagem</Label>
                <Input
                  id="url"
                  placeholder="https://i.pinimg.com/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Título da Imagem</Label>
                <Input
                  id="title"
                  placeholder="Ex: Design de Sobrancelhas"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoryInput} onValueChange={setCategoryInput}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service, index) => (
                    <SelectItem key={service.id ? `${service.id}-${index}` : `category-${index}`} value={service.name}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {services.length === 0 && (
                <p className="text-xs text-destructive mt-1">
                  Nenhum serviço cadastrado. Cadastre um serviço para
                  categorizar suas fotos.
                </p>
              )}
            </div>
            {services.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">
                  As imagens serão categorizadas como:{" "}
                  <span className="font-semibold text-primary">
                    {categoryInput || services[0]?.name}
                  </span>
                </p>
              </div>
            )}
            <Button
              type="button"
              className="w-full bg-[#D946EF] hover:bg-[#C026D3] text-white"
              onClick={handleAddByUrl}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar à Galeria
            </Button>
          </CardContent>
        </Card>

        {/* Gallery Grid */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-medium">
              Imagens na Galeria ({filteredImages.length})
            </h3>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar imagens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-48 bg-background/50">
                  <SelectValue placeholder="Filtrar por serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Serviços</SelectItem>
                  {services.map((service, index) => (
                    <SelectItem key={service.id ? `${service.id}-${index}` : `filter-${index}`} value={service.name}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className="group relative bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm transition-all hover:shadow-md"
              >
                <div className="aspect-square relative bg-muted flex items-center justify-center overflow-hidden">
                  {imageErrors[img.id] ? (
                    <div className="flex flex-col items-center p-4 text-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/50 mb-2" />
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        Erro ao carregar imagem.
                        <br />
                        Verifique se a URL é um link direto de imagem.
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      <Image
                        src={img.imageUrl}
                        alt={img.title || ""}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        onError={() => handleImageError(img.id)}
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="rounded-full w-12 h-12 shadow-lg scale-90 group-hover:scale-100 transition-transform"
                      onClick={() => handleDelete(img.id)}
                    >
                      <Trash2 className="w-6 h-6" />
                    </Button>
                    <Button
                      type="button"
                      variant={img.showInHome ? "default" : "secondary"}
                      size="icon"
                      className={cn(
                        "rounded-full w-12 h-12 shadow-lg scale-90 group-hover:scale-100 transition-transform",
                        img.showInHome
                          ? "bg-[#D946EF] hover:bg-[#C026D3] text-white"
                          : "bg-white/90 hover:bg-white text-black",
                      )}
                      onClick={() => toggleShowOnHome(img.id, img.showInHome)}
                      title={
                        img.showInHome
                          ? "Remover da página inicial"
                          : "Mostrar na página inicial"
                      }
                    >
                      <Home className="w-6 h-6" />
                    </Button>
                  </div>
                  {img.showInHome && (
                    <div className="absolute top-2 left-2 bg-[#D946EF] text-white p-1.5 rounded-full shadow-lg z-10">
                      <Home className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-sm font-medium truncate">{img.title || "Sem título"}</p>
                  <Select
                    value={img.category || ""}
                    onValueChange={(val) => handleUpdateCategory(img.id, val)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-muted/50 border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service, index) => (
                        <SelectItem
                          key={service.id ? `${service.id}-${index}` : `edit-cat-${index}`}
                          value={service.name}
                          className="text-xs"
                        >
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
          {filteredImages.length === 0 && (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
              <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || filterCategory !== "all"
                  ? "Nenhuma imagem encontrada para os filtros aplicados."
                  : "Nenhuma imagem na galeria ainda."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
