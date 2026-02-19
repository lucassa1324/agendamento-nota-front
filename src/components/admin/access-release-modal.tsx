"use client";

import { addDays, differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarClock, 
  CheckCircle2, 
  Loader2, 
  RefreshCcw, 
  ShieldCheck 
} from "lucide-react";
import { useEffect, useState } from "react";

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
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface CompanyData {
  id: string;
  name: string;
  subscriptionStatus: string;
  trialEndsAt?: string;
  accessType?: string;
}

interface AccessReleaseModalProps {
  company: CompanyData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

import { Input } from "@/components/ui/input";

type ReleaseOption = "manual_custom_days" | "extend_trial_custom" | "automatic";

export function AccessReleaseModal({
  company,
  isOpen,
  onClose,
  onSuccess,
}: AccessReleaseModalProps) {
  const [selectedOption, setSelectedOption] = useState<ReleaseOption>("manual_custom_days");
  const [manualDays, setManualDays] = useState(30);
  const [trialDays, setTrialDays] = useState(14);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset e inicialização inteligente ao abrir o modal
  useEffect(() => {
    if (isOpen && company) {
      const today = new Date();
      let remainingDays = 0;

      if (company.trialEndsAt) {
        const endDate = new Date(company.trialEndsAt);
        const diff = differenceInDays(endDate, today);
        remainingDays = diff > 0 ? diff : 0;
      }

      // Lógica de Pré-seleção Baseada no Estado Atual
      if (company.accessType === 'manual') {
        setSelectedOption("manual_custom_days");
        setManualDays(remainingDays > 0 ? remainingDays : 30);
      } else if (company.accessType === 'extended_trial') {
        setSelectedOption("extend_trial_custom");
        setTrialDays(remainingDays > 0 ? remainingDays : 14);
      } else {
        setSelectedOption("automatic");
      }
    }
  }, [isOpen, company]);

  if (!company) return null;

  const today = new Date();
  
  // Cálculos de datas dinâmicos baseados nos inputs
  const dateManualDays = addDays(today, manualDays || 0);
  
  // No novo modelo, "Adiar Teste" define o novo vencimento a partir de HOJE + dias inputados
  const dateExtendTrialDays = addDays(today, trialDays || 0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let payload = {};
      
      switch (selectedOption) {
        case "manual_custom_days":
          payload = {
            status: "active",
            accessType: "manual",
            actionType: "manual_custom_days",
            trialDays: manualDays
          };
          break;
        case "extend_trial_custom":
          payload = {
            status: "trialing",
            accessType: "automatic",
            actionType: "extend_trial_custom",
            trialDays: trialDays
          };
          break;
        case "automatic":
          payload = {
            status: "active",
            accessType: "automatic",
            actionType: "automatic",
          };
          break;
      }

      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/companies/${company.id}/subscription`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      // Tratamento específico para erro 402 (Pagamento Obrigatório / Bloqueio)
      if (response.status === 402) {
        window.location.href = "/acesso-suspenso";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha ao atualizar assinatura");
      }

      toast({
        title: "Sucesso",
        description: "Acesso da empresa atualizado com sucesso.",
      });

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Erro na liberação de acesso:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível realizar a operação.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Acesso: {company.name}</DialogTitle>
          <DialogDescription>
            Defina o tipo de acesso e validade para esta empresa.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedOption}
            onValueChange={(value) => setSelectedOption(value as ReleaseOption)}
            className="gap-4"
          >
            {/* Opção A: Manual Custom Dias */}
            <div className={cn(
              "flex flex-col space-y-3 rounded-md border p-4 hover:bg-zinc-50 transition-colors",
              selectedOption === "manual_custom_days" ? "border-primary bg-zinc-50" : "border-muted"
            )}>
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="manual_custom_days" id="manual_custom_days" className="mt-1" />
                <Label htmlFor="manual_custom_days" className="grid gap-1.5 cursor-pointer font-normal flex-1">
                  <span className="font-semibold flex items-center gap-2 text-foreground">
                    <CalendarClock className="w-4 h-4 text-orange-500" />
                    Liberar Acesso (Manual)
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Libera acesso por dias definidos, independente do pagamento.
                  </span>
                </Label>
              </div>
              
              {selectedOption === "manual_custom_days" && (
                <div className="pl-7 pr-2">
                  <Label htmlFor="manual_days_input" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Qtd. de Dias
                  </Label>
                  <Input 
                    id="manual_days_input"
                    type="number" 
                    min={1} 
                    value={manualDays} 
                    onChange={(e) => setManualDays(parseInt(e.target.value, 10) || 0)}
                    className="h-8 w-24 text-sm bg-background text-foreground"
                  />
                  <span className="text-xs font-medium text-primary mt-2 block">
                    Novo vencimento será em: {format(dateManualDays, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>

            {/* Opção B: Estender Trial Custom Dias */}
            <div className={cn(
              "flex flex-col space-y-3 rounded-md border p-4 hover:bg-zinc-50 transition-colors",
              selectedOption === "extend_trial_custom" ? "border-primary bg-zinc-50" : "border-muted"
            )}>
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="extend_trial_custom" id="extend_trial_custom" className="mt-1" />
                <Label htmlFor="extend_trial_custom" className="grid gap-1.5 cursor-pointer font-normal flex-1">
                  <span className="font-semibold flex items-center gap-2 text-foreground">
                    <RefreshCcw className="w-4 h-4 text-blue-500" />
                    Adiar Teste
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Adiciona dias ao período de teste atual.
                  </span>
                </Label>
              </div>

              {selectedOption === "extend_trial_custom" && (
                <div className="pl-7 pr-2">
                  <Label htmlFor="trial_days_input" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Qtd. de Dias
                  </Label>
                  <Input 
                    id="trial_days_input"
                    type="number" 
                    min={1} 
                    value={trialDays} 
                    onChange={(e) => setTrialDays(parseInt(e.target.value, 10) || 0)}
                    className="h-8 w-24 text-sm bg-background text-foreground"
                  />
                  <span className="text-xs font-medium text-primary mt-2 block">
                    Novo vencimento será em: {format(dateExtendTrialDays, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>

            {/* Opção C: Automático / Padrão */}
            <div className={cn(
              "flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-zinc-50 transition-colors",
              selectedOption === "automatic" ? "border-primary bg-zinc-50" : "border-muted"
            )}>
              <RadioGroupItem value="automatic" id="automatic" className="mt-1" />
              <Label htmlFor="automatic" className="grid gap-1.5 cursor-pointer font-normal">
                <span className="font-semibold flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Automático / Padrão
                </span>
                <span className="text-sm text-muted-foreground">
                  Define status como Ativo sem alterar datas manualmente.
                </span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Confirmar Alteração
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
