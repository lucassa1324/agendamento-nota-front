"use client";

import html2canvas from "html2canvas";
import { Camera, Loader2, MessageSquare, Send } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleTakeScreenshot = async () => {
    setIsTakingScreenshot(true);
    try {
      // Esconde o widget temporariamente para não sair no print
      const widget = document.getElementById("feedback-widget-trigger");
      if (widget) widget.style.display = "none";

      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
      });

      const image = canvas.toDataURL("image/png");
      setScreenshot(image);

      if (widget) widget.style.display = "flex";
      toast.success("Captura de tela realizada com sucesso!");
    } catch (error) {
      console.error("Erro ao tirar print:", error);
      toast.error("Erro ao capturar a tela. Tente novamente.");
    } finally {
      setIsTakingScreenshot(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Por favor, descreva o problema ou sugestão.");
      return;
    }

    if (!screenshot) {
      toast.error("Por favor, tire um print da tela.");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          screenshot,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar feedback");
      }

      toast.success("Feedback enviado com sucesso! Obrigado.");
      setIsOpen(false);
      setDescription("");
      setScreenshot(null);
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
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Enviar Feedback</DialogTitle>
          <DialogDescription>
            Encontrou um erro ou tem uma sugestão? Conte para nós.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o que aconteceu ou sua sugestão..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-25"
            />
          </div>

          <div className="grid gap-2">
            <Label>Captura de Tela</Label>
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
          <Button onClick={handleSubmit} disabled={isSending || !screenshot}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
