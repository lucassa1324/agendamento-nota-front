"use client";

import { useEffect, useState } from "react";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import {
  defaultHeroSettings,
  getStorageKey,
  saveHeroSettings,
} from "@/lib/booking-data";
import { siteCustomizerService } from "@/lib/site-customizer-service";

export function BackendTrigger() {
  const { businessId } = useStudio();
  const { toast } = useToast();
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!businessId || triggered) return;

    // Verificar se já existe um rascunho de hero no localStorage
    const heroKey = getStorageKey("heroSettings");
    const hasLocalDraft = typeof window !== "undefined" && 
      localStorage.getItem(heroKey) !== null;

    if (hasLocalDraft) {
      console.log(`>>> [BackendTrigger] Rascunho local de HERO detectado (chave: ${heroKey}). Ignorando trigger automático para não sobrescrever trabalho do usuário.`);
      setTriggered(true);
      return;
    }

    async function runTrigger() {
      if (!businessId) return; // Re-verificar para o TS
      setTriggered(true);
      console.log(">>> [BackendTrigger] Iniciando ações automáticas para o backend...");

      try {
        // 1. Upload Banner Hero
        const imageUrl = "/professional-eyebrow-artist-at-work.jpg";
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "banner-hero.jpg", { type: "image/jpeg" });

        console.log(">>> [BackendTrigger] Fazendo upload do banner...");
        const uploadedUrl = await siteCustomizerService.uploadBackgroundImage(
          file,
          "hero",
          businessId
        );

        const newHeroSettings = {
          ...defaultHeroSettings,
          title: "Beleza e Autoestima Elevadas ao Máximo",
          subtitle: "Sobrancelhas perfeitas para o seu olhar único.",
          bgType: "image" as const,
          bgImage: uploadedUrl,
          imageOpacity: 1, // Garantir que a imagem apareça bem
          overlayOpacity: 0.3, // Diminuir o overlay para ver melhor a foto
        };

        // 2. Atualizar Local Storage (Draft)
        console.log(">>> [BackendTrigger] Atualizando rascunho local...");
        saveHeroSettings(newHeroSettings);

        // 3. Publicar Customização no Backend
        console.log(">>> [BackendTrigger] Publicando customização...");
        await siteCustomizerService.saveCustomization(businessId, {
          hero: newHeroSettings,
        });

        // 4. Tentar atualizar o preview via postMessage
        console.log(">>> [BackendTrigger] Tentando atualizar o preview via postMessage...");
        const iframes = document.querySelectorAll('iframe');
        for (const iframe of iframes) {
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: "UPDATE_HERO_SETTINGS",
              settings: newHeroSettings
            }, "*");
          }
        }

        toast({
          title: "Sucesso!",
          description: "Banner carregado e aplicado ao preview.",
        });

        console.log(">>> [BackendTrigger] Todas as ações foram disparadas com sucesso!");
      } catch (error: unknown) {
        console.error(">>> [BackendTrigger] Erro ao disparar ações:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao disparar ações.";
        toast({
          title: "Erro no Trigger",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }

    runTrigger();
  }, [businessId, triggered, toast]);

  return null; // Componente invisível
}
