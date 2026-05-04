"use client";

import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL, useSession } from "@/lib/auth-client";
import { businessService } from "@/lib/business-service";

const WEEK_DAYS = [
  { value: "1", label: "Segunda-feira" },
  { value: "2", label: "Terça-feira" },
  { value: "3", label: "Quarta-feira" },
  { value: "4", label: "Quinta-feira" },
  { value: "5", label: "Sexta-feira" },
  { value: "6", label: "Sábado" },
  { value: "0", label: "Domingo" },
];

export default function OnboardingPage() {
  const { toast } = useToast();
  const { studio } = useStudio();
  const { refetch } = useSession();
  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [serviceName, setServiceName] = useState("Atendimento Padrão");
  const [servicePrice, setServicePrice] = useState("80");
  const [serviceDuration, setServiceDuration] = useState("60");
  const [selectedDay, setSelectedDay] = useState("1");
  const [openTime, setOpenTime] = useState("09:00");
  const [lunchStart, setLunchStart] = useState("12:00");
  const [lunchEnd, setLunchEnd] = useState("13:00");
  const [closeTime, setCloseTime] = useState("18:00");

  const targetOverviewPath = useMemo(() => {
    if (!studio?.slug) return "/admin";
    return `/admin/${studio.slug}/dashboard/overview`;
  }, [studio?.slug]);

  useEffect(() => {
    const verifySetup = () => {
      if (!studio?.id || !studio?.slug) return;
      setIsChecking(false);
    };
    verifySetup();
  }, [studio?.id, studio?.slug]);

  const handleCompleteOnboarding = async () => {
    if (!studio?.id || !studio?.slug) {
      toast({
        title: "Erro de inicialização",
        description:
          "Os dados do negócio não foram carregados. Tente recarregar a página.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const createServiceResponse = await customFetch("/api/services", {
        method: "POST",
        body: JSON.stringify({
          companyId: studio.id,
          name: serviceName,
          description: "Serviço inicial criado no onboarding",
          price: Number(servicePrice),
          duration: Number(serviceDuration),
          isVisible: true,
        }),
      });

      if (!createServiceResponse.ok) {
        const errorPayload = await createServiceResponse
          .json()
          .catch(() => ({ error: "Erro ao criar serviço inicial" }));
        throw new Error(errorPayload.error || "Erro ao criar serviço inicial");
      }

      const weekly = WEEK_DAYS.map((day) =>
        day.value === selectedDay
          ? {
              dayOfWeek: day.value,
              status: "OPEN" as const,
              morningStart: openTime,
              morningEnd: lunchStart,
              afternoonStart: lunchEnd,
              afternoonEnd: closeTime,
            }
          : {
              dayOfWeek: day.value,
              status: "CLOSED" as const,
              morningStart: "00:00",
              morningEnd: "00:00",
              afternoonStart: "00:00",
              afternoonEnd: "00:00",
            },
      );

      await businessService.saveSettings({
        companyId: studio.id,
        interval: "00:30",
        weekly,
      });

      await customFetch(`${API_BASE_URL}/api/account/complete-onboarding`, {
        method: "PATCH",
      });

      try {
        // Tenta dar refetch com um timeout de 2 segundos para não travar o usuário
        await Promise.race([
          refetch(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 2000),
          ),
        ]);
      } catch (e) {
        // Ignora erro de refetch para seguir com o redirecionamento
      }

      // Limpa os flags de tour para que apareçam na próxima página
      localStorage.removeItem("tour_overview_v1");
      localStorage.removeItem("tour_customizer_v1");

      toast({
        title: "Configuração concluída",
        description: "Seu negócio está pronto para receber agendamentos.",
      });

      window.location.assign(targetOverviewPath);
      return;
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível concluir a configuração inicial.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Validando configuração inicial...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <h2 className="font-sans text-3xl font-bold text-primary flex items-center gap-2">
          <Sparkles className="w-7 h-7" />
          Configuração Inicial
        </h2>
        <p className="text-muted-foreground">
          Vamos cadastrar seu primeiro serviço e seu horário padrão para você
          começar hoje.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Primeiro serviço</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 space-y-2">
            <Label htmlFor="service-name">Nome do serviço</Label>
            <Input
              id="service-name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Ex: Corte feminino"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-price">Preço (R$)</Label>
            <Input
              id="service-price"
              type="number"
              min={1}
              value={servicePrice}
              onChange={(e) => setServicePrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-duration">Duração (min)</Label>
            <Input
              id="service-duration"
              type="number"
              min={10}
              step={5}
              value={serviceDuration}
              onChange={(e) => setServiceDuration(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="selected-day">Dia principal</Label>
            <select
              id="selected-day"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {WEEK_DAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Horário de funcionamento</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="open-time">Abertura</Label>
            <Input
              id="open-time"
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lunch-start">Início almoço</Label>
            <Input
              id="lunch-start"
              type="time"
              value={lunchStart}
              onChange={(e) => setLunchStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lunch-end">Fim almoço</Label>
            <Input
              id="lunch-end"
              type="time"
              value={lunchEnd}
              onChange={(e) => setLunchEnd(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="close-time">Fechamento</Label>
            <Input
              id="close-time"
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleCompleteOnboarding} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Finalizando...
            </>
          ) : (
            <>
              Concluir configuração
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
