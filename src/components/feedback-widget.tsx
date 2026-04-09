"use client";

import { toPng } from "html-to-image";
import { Camera, CheckCircle2, Loader2, MessageSquare, Send } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

type FeedbackType = "bug" | "suggestion";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTakeScreenshot = async () => {
    setIsTakingScreenshot(true);
    setIsOpen(false); // Esconde o modal para não sair no print

    // Pequeno delay para garantir que o modal e o backdrop fecharam (animação)
    await new Promise((resolve) => setTimeout(resolve, 400));

    try {
      const dataUrl = await toPng(document.body, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        style: {
          // Garante que o widget e o modal não apareçam (mesmo que já tenham sido escondidos)
          visibility: "visible",
        },
        filter: (node) => {
          // Filtra o próprio modal ou botões de feedback se ainda estiverem no DOM
          const exclusionIds = [
            "feedback-widget-trigger",
            "feedback-dialog-content",
          ];
          if (node instanceof HTMLElement && exclusionIds.includes(node.id)) {
            return false;
          }
          return true;
        },
      });

      setScreenshot(dataUrl);
      toast.success("Captura de tela realizada com sucesso!");
    } catch (error) {
      console.error("Erro ao tirar print:", error);
      toast.error("Erro ao capturar a tela. Tente novamente.");
    } finally {
      setIsTakingScreenshot(false);
      setIsOpen(true); // Reabre o modal já com o print
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Por favor, descreva o problema ou sugestão.");
      return;
    }

    if (feedbackType === "bug" && !screenshot) {
      toast.error("Por favor, tire um print da tela.");
      return;
    }

    const metadata = {
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${window.screen.width}x${window.screen.height}`,
      pixelRatio: window.devicePixelRatio,
      referrer: document.referrer || null,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      deviceMemory:
        "deviceMemory" in navigator
          ? Number(
              (navigator as Navigator & { deviceMemory?: number })
                .deviceMemory ?? null,
            )
          : null,
      routePath: window.location.pathname,
      routeQuery: window.location.search,
      submittedAt: new Date().toISOString(),
    };

    setIsSending(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: feedbackType,
          description,
          screenshot,
          url: window.location.href,
          userAgent: navigator.userAgent,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar feedback");
      }

      setShowSuccess(true);
      
      // Limpa os campos
      setFeedbackType("bug");
      setDescription("");
      setScreenshot(null);

      // Fecha o modal após 3 segundos
      setTimeout(() => {
        setIsOpen(false);
        // Reset do estado de sucesso para o próximo uso
        setTimeout(() => setShowSuccess(false), 500);
      }, 3000);
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast.error("Erro ao enviar feedback. Tente novamente mais tarde.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          id="feedback-widget-trigger"
          className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-all"
          size="icon"
          title="Enviar Feedback"
          disabled={isTakingScreenshot}
        >
          {isTakingScreenshot ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <MessageSquare className="h-6 w-6" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent id="feedback-dialog-content" className="sm:max-w-125 overflow-hidden">
        {showSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Obrigado!</h2>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Seu feedback foi enviado com sucesso. Isso nos ajuda muito a melhorar a plataforma.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsOpen(false)}
            >
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Enviar Feedback</DialogTitle>
              <DialogDescription>
                Encontrou um erro ou tem uma sugestão? Conte para nós.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <RadioGroup
                  value={feedbackType}
                  onValueChange={(value) => setFeedbackType(value as FeedbackType)}
                  className="grid grid-cols-2 gap-2"
                >
                  <Label
                    htmlFor="feedback-type-bug"
                    className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem id="feedback-type-bug" value="bug" />
                    Relatar Bug
                  </Label>
                  <Label
                    htmlFor="feedback-type-suggestion"
                    className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem
                      id="feedback-type-suggestion"
                      value="suggestion"
                    />
                    Dar Sugestão
                  </Label>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder={
                    feedbackType === "bug"
                      ? "Descreva o bug, os passos para reproduzir e o comportamento esperado..."
                      : "Descreva sua sugestão de melhoria..."
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-25"
                />
              </div>

              <div className="grid gap-2">
                <Label>
                  Captura de Tela{" "}
                  {feedbackType === "bug" ? "(obrigatória)" : "(opcional)"}
                </Label>
                {screenshot ? (
                  <div className="relative border rounded-md overflow-hidden bg-muted group w-full h-40">
                    <Image
                      src={screenshot}
                      alt="Screenshot preview"
                      fill
                      className="object-cover object-top cursor-pointer transition-transform hover:scale-105"
                      onClick={() => window.open(screenshot, "_blank")}
                      unoptimized
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setScreenshot(null)}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-20 border-dashed"
                    onClick={handleTakeScreenshot}
                    disabled={isTakingScreenshot}
                  >
                    {isTakingScreenshot ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Capturando...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Tirar Print da Tela Atual
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSending || (feedbackType === "bug" && !screenshot)}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {feedbackType === "bug" ? "Enviar Bug" : "Enviar Sugestão"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
