"use client";

import confetti from "canvas-confetti";
import { Sparkles, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Joyride, { type CallBackProps, STATUS, type Step, type TooltipRenderProps } from "react-joyride";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";

// Componente customizado para o Tooltip (Aura Persona)
const Tooltip = ({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) => {
  return (
    <div
      {...tooltipProps}
      className="bg-card border border-border rounded-xl shadow-xl max-w-sm p-0 overflow-hidden relative"
    >
      {/* Aura Header */}
      <div className="bg-primary/10 p-4 flex items-center gap-3 border-b border-border/50">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm ring-2 ring-primary/20">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Aura</h3>
          <p className="text-xs text-muted-foreground">Sua assistente inteligente</p>
        </div>
        <button
          {...closeProps}
          className="absolute top-2 right-2 p-1 hover:bg-black/5 rounded-full transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-4 text-sm text-foreground leading-relaxed">
          {step.content}
        </div>

        {/* Footer / Actions */}
        <div className="flex justify-between items-center mt-4 pt-2">
          <div className="flex gap-1">
            {index > 0 && (
              <Button
                {...backProps}
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
              >
                Voltar
              </Button>
            )}
          </div>
          
          <Button
            {...primaryProps}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs px-4"
          >
            {isLastStep ? "Começar a Usar! 🚀" : "Próximo"}
          </Button>
        </div>
      </div>
      
      {/* Arrow (handled by Joyride mostly, but we can style if needed) */}
    </div>
  );
};

export function WelcomeTour() {
  const { data: session, isPending } = useSession();
  const [run, setRun] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();

  // Detect mobile
  useEffect(() => {
    // FORCE SESSION REFRESH: Ensure we have the latest data from backend
    // This fixes the issue where local session is stale (true) but backend is reset (false)
    const refreshSession = async () => {
      console.log(">>> [ONBOARDING] Forçando atualização da sessão...");
      await authClient.getSession({
        fetchOptions: {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      });
    };
    refreshSession();

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Steps definition for Desktop
  const desktopSteps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <p className="font-medium mb-1">Olá, {session?.user?.name?.split(" ")[0]}! 👋</p>
          <p>
            Eu sou a <strong>Aura</strong>. 🎉 Estou aqui para te ajudar a organizar seu negócio.
            Vamos conhecer seu novo painel?
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "#sidebar-operational",
      content: (
        <div>
          <p>
            <strong>Aqui é onde o dia a dia acontece.</strong>
          </p>
          <p className="mt-1">
            Gerencie seus Agendamentos e defina seus Serviços e Horários de atendimento.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#sidebar-administrative",
      content: (
        <div>
          <p>
            <strong>Precisa de controle?</strong>
          </p>
          <p className="mt-1">
            Aqui você cuida do seu Estoque e acompanha o crescimento em Relatórios.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#sidebar-settings",
      content: (
        <div>
          <p>
            <strong>Aqui é o coração da sua marca.</strong> 💖
          </p>
          <p className="mt-1">
            Em Personalização, você deixa o site com a sua cara para encantar suas clientes.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#sidebar-view-site",
      content: (
        <div>
          <p>
            Sempre que quiser ver como suas clientes enxergam sua agenda, clique aqui em{" "}
            <strong>Ir para o site</strong>.
          </p>
        </div>
      ),
      placement: "right",
    },
  ];

  // Steps definition for Mobile
  const mobileSteps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <p className="font-medium mb-1">Olá, {session?.user?.name?.split(" ")[0]}! 👋</p>
          <p>
            Eu sou a <strong>Aura</strong>. 🎉 Estou aqui para te ajudar a organizar seu negócio.
            Como você está no celular, tudo fica guardadinho no menu.
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "#mobile-menu-btn",
      content: (
        <div>
          <p>
            <strong>Tudo começa aqui!</strong> 👆
          </p>
          <p className="mt-1">
            Toque neste botão para abrir o menu e acessar todas as ferramentas: <strong>Agendamentos</strong>, <strong>Estoque</strong>, <strong>Relatórios</strong> e muito mais.
          </p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "body",
      content: (
        <div>
          <p>
            <strong>Explore com calma!</strong> 🚀
          </p>
          <p className="mt-1">
            Configure seus horários, personalize seu site e acompanhe seus ganhos direto pelo celular.
          </p>
        </div>
      ),
      placement: "center",
    },
  ];

  useEffect(() => {
    // Check if user is loaded and hasn't completed onboarding
    // Also check localStorage to avoid loop if API fails
    const localCompleted = localStorage.getItem("tour-completed");
    
    // Cast user to a type that includes hasCompletedOnboarding
    const user = session?.user as { hasCompletedOnboarding?: boolean; name?: string };

    console.log(">>> [ONBOARDING] Estado:", {
      isPending,
      hasSession: !!session,
      hasCompletedOnboarding: user?.hasCompletedOnboarding,
      localCompleted
    });

    if (
      !isPending && 
      user && 
      !user.hasCompletedOnboarding && 
      !localCompleted
    ) {
      // Add a small delay to ensure UI is ready
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isPending, session]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status } = data;
    
    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setRun(false);
      // Save to localStorage immediately as fallback
      localStorage.setItem("tour-completed", "true");

      if (status === STATUS.FINISHED) {
        // Confetti effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#9333ea", "#a855f7", "#c084fc", "#e879f9"], // Purple/Pink theme
        });

        // Call API to complete onboarding
        try {
          // Opção 1: Usando authClient.updateUser (Recomendado se suportado)
           await authClient.updateUser({
             hasCompletedOnboarding: true,
             // biome-ignore lint/suspicious/noExplicitAny: Type inference for additionalFields not working yet
           } as any);
           
          // Opção 2: Chamada explícita para o endpoint solicitado, caso o updateUser não seja suficiente
          // await fetch("/api/user/complete-onboarding", { method: "PATCH" });
          
          console.log(">>> [ONBOARDING] Onboarding concluído com sucesso!");
        } catch (error) {
          console.error(">>> [ONBOARDING] Erro ao salvar estado de onboarding:", error);
        }
      }
    }
  };

  if (!run) return null;

  return (
    <Joyride
      steps={isMobile ? mobileSteps : desktopSteps}
      run={run}
      continuous
      showSkipButton
      showProgress
      disableOverlayClose={true}
      spotlightClicks={false}
      callback={handleJoyrideCallback}
      tooltipComponent={Tooltip}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#9333ea", // Purple-600
          textColor: theme === "dark" ? "#fff" : "#0f172a",
          backgroundColor: theme === "dark" ? "#1e293b" : "#fff",
        },
        spotlight: {
          borderRadius: "12px",
        },
      }}
    />
  );
}
