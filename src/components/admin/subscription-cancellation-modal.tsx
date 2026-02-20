"use client";

import {
  AlertTriangle,
  ArrowRight,
  Gift,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextInvoiceDate: string;
}

type CancellationReason =
  | "expensive"
  | "not_used_enough"
  | "missing_features"
  | "competitor";

export function SubscriptionCancellationModal({
  isOpen,
  onClose,
  nextInvoiceDate,
}: SubscriptionCancellationModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reason, setReason] = useState<CancellationReason | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = () => {
    if (step === 1 && reason) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleAcceptOffer = () => {
    // Mock de aceitação da oferta
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Oferta Aceita!",
        description:
          reason === "expensive"
            ? "O desconto de 20% foi aplicado à sua conta."
            : "Nossa equipe entrará em contato em breve para agendar a call.",
      });
      onClose();
      resetModal();
    }, 1500);
  };

  const handleConfirmCancellation = () => {
    // Mock de confirmação de cancelamento
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Assinatura Cancelada",
        description: "Sua conta foi agendada para cancelamento.",
      });
      onClose();
      resetModal();
    }, 2000);
  };

  const resetModal = () => {
    setStep(1);
    setReason(null);
  };

  const renderStep1 = () => (
    <div className="space-y-4 py-4">
      <RadioGroup
        value={reason || ""}
        onValueChange={(value) => setReason(value as CancellationReason)}
        className="space-y-3"
      >
        <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-slate-50 cursor-pointer transition-colors">
          <RadioGroupItem value="expensive" id="expensive" />
          <Label htmlFor="expensive" className="flex-1 cursor-pointer">
            Achei caro
          </Label>
        </div>
        <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-slate-50 cursor-pointer transition-colors">
          <RadioGroupItem value="not_used_enough" id="not_used_enough" />
          <Label htmlFor="not_used_enough" className="flex-1 cursor-pointer">
            Não uso o suficiente
          </Label>
        </div>
        <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-slate-50 cursor-pointer transition-colors">
          <RadioGroupItem value="missing_features" id="missing_features" />
          <Label htmlFor="missing_features" className="flex-1 cursor-pointer">
            Faltam recursos
          </Label>
        </div>
        <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-slate-50 cursor-pointer transition-colors">
          <RadioGroupItem value="competitor" id="competitor" />
          <Label htmlFor="competitor" className="flex-1 cursor-pointer">
            Mudei para um concorrente
          </Label>
        </div>
      </RadioGroup>
    </div>
  );

  const renderStep2 = () => {
    if (reason === "expensive") {
      return (
        <div className="py-6 space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-4">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-green-600">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-green-800">
              Queremos você conosco!
            </h3>
            <p className="text-green-700">
              Entendemos que o custo é importante. Que tal{" "}
              <strong>20% de desconto</strong> nos próximos 3 meses para você
              continuar aproveitando todos os recursos?
            </p>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleAcceptOffer}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Aceitar 20% de Desconto
            </Button>
          </div>
        </div>
      );
    }

    // Para "not_used_enough", "missing_features" e "competitor"
    return (
      <div className="py-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center space-y-4">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-blue-600">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-blue-800">
            Podemos ajudar a configurar?
          </h3>
          <p className="text-blue-700">
            Muitas vezes o sistema tem o que você precisa, mas falta um ajuste.
            Gostaria de marcar uma <strong>call de 15 min</strong> com nosso
            suporte especializado para otimizar seu uso?
          </p>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleAcceptOffer}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Agendar Call Gratuita
          </Button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="py-6 space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-800">
              Aviso Final de Cancelamento
            </h3>
            <p className="text-sm text-red-700">
              Ao confirmar, sua conta voltará para o plano gratuito em{" "}
              <strong>{nextInvoiceDate}</strong>.
            </p>
            <div className="bg-white/50 p-3 rounded border border-red-100">
              <p className="text-xs font-semibold text-red-800 mb-1">
                Você perderá acesso imediato a:
              </p>
              <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
                <li>Relatórios avançados de faturamento</li>
                <li>Lembretes automáticos via WhatsApp</li>
                <li>Gestão de múltiplos profissionais</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetModal();
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Por que você decidiu cancelar?"}
            {step === 2 && "Antes de ir..."}
            {step === 3 && "Confirmar Cancelamento"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 &&
              "Sua opinião é muito importante para melhorarmos nosso serviço."}
            {step === 2 && "Temos uma proposta especial para você."}
            {step === 3 && "Esta ação não poderá ser desfeita imediatamente."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
          {step === 1 && (
            <Button
              className="w-full"
              onClick={handleNextStep}
              disabled={!reason}
            >
              Próximo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {step === 2 && (
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-destructive"
              onClick={() => setStep(3)}
            >
              Não, prefiro cancelar
            </Button>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-2 w-full">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleConfirmCancellation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Confirmar Cancelamento
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => onClose()}
                disabled={isLoading}
              >
                Manter minha assinatura
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
