"use client";

import { AlertTriangle, ArrowRight, Gift, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL, signOut } from "@/lib/auth-client";

interface SubscriptionCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId?: string;
}

type CancellationReason =
  | "expensive"
  | "competitor"
  | "missing_features"
  | "business_closed"
  | "other";

interface Offer {
  percentage: number;
  durationMonths: number;
}

export function SubscriptionCancellationModal({
  isOpen,
  onClose,
  subscriptionId,
}: SubscriptionCancellationModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Feedback
  const [reason, setReason] = useState<CancellationReason | null>(null);
  const [customReason, setCustomReason] = useState("");
  const [details, setDetails] = useState("");

  // Step 2: Offer
  const [offer, setOffer] = useState<Offer | null>(null);

  // Step 3: Confirmation
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  const resetModal = () => {
    setStep(1);
    setReason(null);
    setCustomReason("");
    setDetails("");
    setOffer(null);
    setConfirmationChecked(false);
    setIsLoading(false);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      // Optional: resetModal() after animation
    }
  };

  // 1. Submit Feedback & Check Offer
  const handleFeedbackSubmit = async () => {
    if (!reason) return;
    if (reason === "other" && !customReason.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, especifique o motivo.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Send Feedback
      const feedbackBody = {
        reason: reason === "other" ? customReason : reason,
        details,
        customReason: reason === "other" ? customReason : undefined,
      };

      await customFetch(`${API_BASE_URL}/api/account/cancel-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackBody),
      });

      // Check for Offer
      const offerRes = await customFetch(
        `${API_BASE_URL}/api/account/cancellation-offer`,
      );
      const offerData = await offerRes.json();

      if (offerData.available && offerData.offer) {
        setOffer(offerData.offer);
        setStep(2);
      } else {
        setStep(3);
      }
    } catch (error) {
      console.error("Erro ao processar feedback:", error);
      // Fallback to confirmation step on error to avoid trapping user
      setStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Accept Offer
  const handleAcceptOffer = async () => {
    setIsLoading(true);
    try {
      const res = await customFetch(
        `${API_BASE_URL}/api/account/accept-offer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId }),
        },
      );

      if (!res.ok) {
        throw new Error("Falha ao aceitar oferta");
      }

      toast({
        title: "Oferta Aceita!",
        description:
          "Desconto aplicado com sucesso! Obrigado por continuar conosco.",
      });
      onClose();
      resetModal();
    } catch (error) {
      console.error("Erro ao aceitar oferta:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar o desconto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectOffer = () => {
    setStep(3);
  };

  // 3. Terminate Account
  const handleTerminate = async () => {
    if (!confirmationChecked) return;

    setIsLoading(true);
    try {
      const res = await customFetch(`${API_BASE_URL}/api/account/terminate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!res.ok) {
        throw new Error("Falha ao encerrar conta");
      }

      toast({
        title: "Conta Encerrada",
        description: "Sua assinatura foi cancelada com sucesso.",
      });

      // Force Logout and Redirect
      await signOut();
      router.push("/admin"); // Or Landing Page
    } catch (error) {
      console.error("Erro ao encerrar conta:", error);
      toast({
        title: "Erro",
        description:
          "Não foi possível cancelar sua assinatura. Tente novamente ou contate o suporte.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        {/* Header varies by step */}
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Por que você está nos deixando?"}
            {step === 2 && "Espere! Valorizamos você."}
            {step === 3 && "Tem certeza que deseja cancelar?"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Seu feedback é muito importante para melhorarmos."}
            {step === 2 &&
              "Temos uma proposta especial para você continuar conosco."}
            {step === 3 &&
              "Esta ação é irreversível e o acesso será bloqueado imediatamente."}
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: FEEDBACK */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <RadioGroup
              value={reason || ""}
              onValueChange={(val) => setReason(val as CancellationReason)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expensive" id="expensive" />
                <Label htmlFor="expensive">Muito caro</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="competitor" id="competitor" />
                <Label htmlFor="competitor">Mudei para um concorrente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="missing_features"
                  id="missing_features"
                />
                <Label htmlFor="missing_features">Faltam funcionalidades</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="business_closed" id="business_closed" />
                <Label htmlFor="business_closed">Fechei o negócio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Outro motivo</Label>
              </div>
            </RadioGroup>

            {reason === "other" && (
              <Input
                placeholder="Qual o motivo?"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}

            <Textarea
              placeholder="Detalhes opcionais (o que poderíamos melhorar?)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="resize-none"
            />
          </div>
        )}

        {/* STEP 2: OFFER */}
        {step === 2 && offer && (
          <div className="py-4 space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
              <Gift className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-primary">
              {offer.percentage}% de Desconto
            </h4>
            <p className="text-muted-foreground">
              Para ajudar no seu negócio, oferecemos{" "}
              <strong>{offer.percentage}% de desconto</strong> nas próximas{" "}
              <strong>{offer.durationMonths} mensalidades</strong>.
            </p>
            <p className="text-sm">
              Aceita continuar conosco com essa condição?
            </p>
          </div>
        )}

        {/* STEP 3: CONFIRMATION */}
        {step === 3 && (
          <div className="py-4 space-y-4">
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm text-red-900">
                <p className="font-semibold mb-1">Aviso Crítico</p>
                <p>
                  Seus dados serão mantidos por 365 dias para fins legais (LGPD)
                  e depois excluídos permanentemente. O acesso ao painel será
                  revogado agora.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <Checkbox
                id="confirm-cancel"
                checked={confirmationChecked}
                onCheckedChange={(c) => setConfirmationChecked(c === true)}
              />
              <Label
                htmlFor="confirm-cancel"
                className="cursor-pointer text-sm font-medium"
              >
                Estou ciente e quero cancelar minha conta
              </Label>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:justify-between gap-2">
          {step === 1 && (
            <Button
              onClick={handleFeedbackSubmit}
              disabled={!reason || isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {step === 2 && (
            <div className="flex flex-col-reverse sm:flex-row gap-2 w-full">
              <Button
                variant="ghost"
                onClick={handleRejectOffer}
                className="w-full sm:w-auto"
              >
                Não obrigado, quero cancelar
              </Button>
              <Button
                onClick={handleAcceptOffer}
                className="w-full sm:w-1/2"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Aceitar Oferta
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-2 w-full">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="w-full"
              >
                Cancelar Operação (Manter Conta)
              </Button>
              <Button
                variant="destructive"
                onClick={handleTerminate}
                disabled={!confirmationChecked || isLoading}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Cancelamento
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
