"use client";

import imageCompression from "browser-image-compression";
import { Loader2, RotateCcw, Upload, X } from "lucide-react";
import NextImage from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { siteCustomizerService } from "@/lib/site-customizer-service";
import { cn } from "@/lib/utils";

 
export interface BackgroundSettings {
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  imageOpacity: number;
  overlayOpacity: number;
  imageScale: number;
  imageX: number;
  imageY: number;
  appearance?: {
    backgroundImageUrl?: string;
    overlay?: {
      color: string;
      opacity: number;
    };
  };
}

export interface BackgroundEditorProps {
   settings: BackgroundSettings;
   onUpdate: (updates: Partial<BackgroundSettings>) => void;
  sectionId?: string;
  section?: string;
  businessId?: string;
}

export function BackgroundEditor({
  settings,
  onUpdate,
  sectionId = "section",
  section = "general",
  businessId = "",
}: BackgroundEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalização local: se bgImage estiver vazio mas appearance tiver a URL, usamos ela.
  // Isso resolve o problema da imagem sumir no editor se os campos estiverem dessincronizados.
  const currentBgImage = settings.appearance?.backgroundImageUrl || settings.bgImage || "";

  if (section === "services") {
    console.log(`[BackgroundEditor] Debug para 'services':`, {
      bgImage: settings.bgImage,
      appearanceUrl: settings.appearance?.backgroundImageUrl,
      currentBgImage
    });
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(">>> [BackgroundEditor] EVENTO: Usuário clicou em 'Abrir' no seletor de arquivos.");
    const file = e.target.files?.[0];
    if (!file) {
      console.log(">>> [BackgroundEditor] Nenhum arquivo selecionado.");
      return;
    }

    if (!businessId) {
      console.error(">>> [BackgroundEditor] ERRO: businessId está vazio! O upload pode falhar.");
      alert("Atenção: ID da empresa não encontrado. Tente recarregar a página.");
      return;
    }

    console.log(">>> [BackgroundEditor] Arquivo selecionado:", {
      nome: file.name,
      tamanho: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      tipo: file.type,
      ultimaModificacao: new Date(file.lastModified).toLocaleString(),
    });

    // Validações básicas
    if (!file.type.startsWith("image/")) {
      console.error(">>> [BackgroundEditor] Erro: O arquivo selecionado não é uma imagem.", file.type);
      alert("Por favor, selecione um arquivo de imagem.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      console.error(">>> [BackgroundEditor] Erro: Imagem muito grande (> 10MB).", file.size);
      alert("A imagem deve ter no máximo 10MB.");
      return;
    }

    setIsUploading(true);

    try {
      // 0. Guardar URL da imagem antiga para deleção posterior (usando valor normalizado)
      const oldImageUrl = currentBgImage;
      const isInternalStorage = oldImageUrl?.includes("/api/storage/");

      console.log(">>> [BackgroundEditor] Iniciando compressão da imagem...");
      // Compressão
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      console.log(">>> [BackgroundEditor] Compressão concluída com sucesso:", {
        tamanhoOriginal: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        tamanhoComprimido: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
      });

      // Upload para o servidor (Passo 1 do fluxo obrigatório)
      console.log(
        `>>> [BackgroundEditor] Chamando siteCustomizerService.uploadBackgroundImage (section: ${section}, businessId: ${businessId})...`,
      );
      const imageUrl = await siteCustomizerService.uploadBackgroundImage(
        compressedFile,
        section,
        businessId,
      );

      console.log(
        ">>> [BackgroundEditor] Resultado do Service:",
        imageUrl,
      );

      if (!imageUrl) {
        console.error(">>> [BackgroundEditor] ERRO: URL da imagem retornada está vazia!");
        // Não dar alert aqui se o service já logou o erro, mas vamos manter por segurança para o usuário
        alert("O servidor não retornou o endereço da imagem. Verifique o console do navegador para mais detalhes.");
        return;
      }

      // Atualizar estado com a URL retornada (Passo 2 do fluxo obrigatório)
      console.log(">>> [BackgroundEditor] Atualizando estado local via onUpdate com URL:", imageUrl);
      onUpdate({ 
        bgImage: imageUrl, 
        bgType: "image",
        appearance: {
          ...settings.appearance,
          backgroundImageUrl: imageUrl
        }
      });
      
      // 3. Limpeza: Deletar a imagem antiga do storage se ela for nossa
      if (oldImageUrl && isInternalStorage) {
        console.log(">>> [BackgroundEditor] Iniciando limpeza da imagem antiga no storage...");
        // Não usamos await aqui para não bloquear a interface do usuário, 
        // a limpeza acontece em background no backend
        siteCustomizerService.deleteBackgroundImage(oldImageUrl, businessId)
          .then(success => {
            if (success) {
              console.log(">>> [BackgroundEditor] Limpeza concluída com sucesso.");
            } else {
              console.warn(">>> [BackgroundEditor] Falha na limpeza da imagem antiga.");
            }
          })
          .catch(err => {
            console.error(">>> [BackgroundEditor] Erro ao tentar limpar imagem antiga:", err);
          });
      }
      
      console.log(">>> [BackgroundEditor] Processo de upload finalizado com sucesso.");
    } catch (error) {
      console.error(">>> [BackgroundEditor] ERRO CRÍTICO no processo de upload:", error);
      alert("Erro ao processar imagem. Verifique o console para mais detalhes.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        console.log(">>> [BackgroundEditor] Limpando o input de arquivo.");
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <fieldset
      className="space-y-6 pt-2 border-none p-0 m-0"
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
    >
      <div>
        <RadioGroup
          value={settings.bgType || "color"}
          onValueChange={(v: string) => onUpdate({ bgType: v as "color" | "image" })}
          className="grid grid-cols-2 gap-2 bg-muted/50 p-1 rounded-md"
        >
          <div className="flex items-center justify-center">
            <RadioGroupItem
              value="color"
              id={`${sectionId}-bg-color`}
              className="sr-only"
            />
            <Label
              htmlFor={`${sectionId}-bg-color`}
              className={cn(
                "flex-1 text-center py-1.5 rounded-sm text-[10px] font-bold uppercase cursor-pointer transition-all",
                settings.bgType === "color"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Cor Sólida
            </Label>
          </div>
          <div className="flex items-center justify-center">
            <RadioGroupItem
              value="image"
              id={`${sectionId}-bg-image`}
              className="sr-only"
            />
            <Label
              htmlFor={`${sectionId}-bg-image`}
              className={cn(
                "flex-1 text-center py-1.5 rounded-sm text-[10px] font-bold uppercase cursor-pointer transition-all",
                settings.bgType === "image"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Imagem
            </Label>
          </div>
        </RadioGroup>
      </div>

      {settings.bgType === "color" ? (
        <fieldset className="space-y-1.5 border-none p-0 m-0">
          <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
            Cor de Fundo
            {settings.bgColor && (
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:text-primary"
                onClick={() => onUpdate({ bgColor: "" })}
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            )}
          </legend>
          <div className="flex gap-2">
            <Input
              type="color"
              value={settings.bgColor || "#ffffff"}
              className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ bgColor: e.target.value })}
            />
            <Input
              value={settings.bgColor || ""}
              placeholder="Padrão do Site"
              className="h-8 text-[10px] flex-1 uppercase"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ bgColor: e.target.value })}
            />
          </div>
        </fieldset>
      ) : (
        <div className="space-y-6">
          <fieldset className="space-y-1.5 border-none p-0 m-0">
            <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
              URL da Imagem
              {currentBgImage && (
                <span className="text-[9px] lowercase font-mono opacity-70">
                  ({currentBgImage.split("/").pop()?.split("?")[0]})
                </span>
              )}
            </legend>
            <div className="flex gap-2">
              <Input
                value={currentBgImage || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdate({ 
                    bgImage: e.target.value, 
                    bgType: "image",
                    appearance: {
                      ...settings.appearance,
                      backgroundImageUrl: e.target.value
                    }
                  })
                }
                className="h-8 text-xs flex-1"
                placeholder="https://..."
              />
              {currentBgImage && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    const oldUrl = currentBgImage;
                    onUpdate({ 
                      bgImage: "", 
                      bgType: "color",
                      appearance: {
                        ...settings.appearance,
                        backgroundImageUrl: ""
                      }
                    });
                    
                    // Limpar do storage se for nossa
                    if (oldUrl?.includes("/api/storage/")) {
                      siteCustomizerService.deleteBackgroundImage(oldUrl, businessId);
                    }
                  }}
                  title="Remover Imagem"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Preview local da imagem para diagnóstico */}
            {currentBgImage && (
              <div className="mt-2 relative aspect-video w-full rounded-md overflow-hidden border border-border/50 bg-muted/20">
                <NextImage 
                  src={currentBgImage} 
                  alt="Preview" 
                  fill
                  unoptimized
                  className="object-cover"
                  onError={() => {
                    console.error(">>> [BackgroundEditor] Erro ao carregar preview da imagem:", currentBgImage);
                  }}
                />
                <div className="absolute bottom-1 right-1 bg-black/60 text-[8px] text-white px-1 rounded">
                  Preview do Editor
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            <Button
              variant="outline"
              className="w-full h-10 border-dashed text-xs gap-2"
              onClick={() => {
                console.log(">>> [BackgroundEditor] Botão de upload clicado. Abrindo seletor de arquivos...");
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" /> Fazer Upload
                </>
              )}
            </Button>
          </fieldset>

          <fieldset className="space-y-1.5 border-none p-0 m-0">
            <div className="flex justify-between items-center">
              <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
                Opacidade da Imagem
              </legend>
              <span className="text-[10px] font-mono">
                {Math.round((settings.imageOpacity || 0) * 100)}%
              </span>
            </div>
            <Slider
              value={[(settings.imageOpacity || 0) * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={([v]: number[]) => onUpdate({ imageOpacity: v / 100 })}
              className="py-2"
            />
          </fieldset>

          <fieldset className="space-y-1.5 border-none p-0 m-0 pt-4 border-t border-border/30">
            <legend className="text-[10px] uppercase text-primary/70 font-bold mb-1.5">
              Ajuste Manual da Imagem
            </legend>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] text-muted-foreground">
                  Zoom (Escala)
                </Label>
                <span className="text-[10px] font-mono">
                  {(settings.imageScale || 1).toFixed(2)}x
                </span>
              </div>
              <Slider
                value={[settings.imageScale || 1]}
                min={1}
                max={3}
                step={0.01}
                onValueChange={([v]: number[]) => onUpdate({ imageScale: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] text-muted-foreground">
                    Posição X
                  </Label>
                  <span className="text-[10px] font-mono">
                    {settings.imageX || 50}%
                  </span>
                </div>
                <Slider
                  value={[settings.imageX || 50]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]: number[]) => onUpdate({ imageX: v })}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] text-muted-foreground">
                    Posição Y
                  </Label>
                  <span className="text-[10px] font-mono">
                    {settings.imageY || 50}%
                  </span>
                </div>
                <Slider
                  value={[settings.imageY || 50]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]: number[]) => onUpdate({ imageY: v })}
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[10px] uppercase h-8 text-muted-foreground hover:text-primary gap-1.5"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onUpdate({
                  imageScale: 1,
                  imageX: 50,
                  imageY: 50,
                });
              }}
            >
              <RotateCcw className="w-3 h-3" /> Resetar Ajustes
            </Button>
          </fieldset>
        </div>
      )}

      <fieldset className="space-y-1.5 border-none p-0 m-0 pt-4 border-t border-border/30">
        <div className="flex justify-between items-center">
          <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
            {settings.bgType === "image"
              ? "Intensidade do Gradiente"
              : "Sobreposição de Cor"}
          </legend>
          <span className="text-[10px] font-mono">
            {Math.round((settings.overlayOpacity || 0) * 100)}%
          </span>
        </div>
        <Slider
          value={[(settings.overlayOpacity || 0) * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={([v]) => onUpdate({ overlayOpacity: v / 100 })}
        />
        <p className="text-[9px] text-muted-foreground mt-1">
          {settings.bgType === "image"
            ? "Cria um degradê suave para melhorar a leitura do texto sobre a imagem."
            : "Aplica uma camada de cor extra sobre o fundo escolhido."}
        </p>
      </fieldset>
    </fieldset>
  );
}
