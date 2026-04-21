"use client";

import { BookOpen, ExternalLink, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LANDING_PAGE_URL } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const TUTORIAL_MAPPING: Record<string, { slug: string; title: string }> = {
  "/agenda": {
    slug: "gestao-agendamentos",
    title: "Gestão de Agendamentos",
  },
  "/agendamentos": {
    slug: "gestao-agendamentos",
    title: "Gestão de Agendamentos",
  },
  "/estoque": {
    slug: "gestao-estoque",
    title: "Gestão de Estoque",
  },
  "/personalizacao": {
    slug: "tutorial-editor",
    title: "Editor de Site",
  },
  "/gerenciamento": {
    slug: "configurar-primeiro-negocio",
    title: "Configuração do Negócio",
  },
  "/relatorios": {
    slug: "conceitos-financeiro",
    title: "Conceitos Financeiros",
  },
  "/overview": {
    slug: "conceitos-financeiro",
    title: "Visão Geral e Financeiro",
  },
  "/notificacoes": {
    slug: "notificacoes-automaticas",
    title: "Notificações Automáticas",
  },
};

/**
 * TutorialContextualLink:
 * Um link discreto que pode ser colocado em qualquer página do dashboard.
 * Fica ao lado do título ou subtítulo da página.
 */
export function TutorialContextualLink() {
  const pathname = usePathname();
  const [currentTutorial, setCurrentTutorial] = useState<{
    slug: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    const dashboardMatch = pathname?.match(/\/dashboard(\/.*)?$/);
    const relativePath = dashboardMatch ? dashboardMatch[1] || "/" : null;
    
    if (relativePath && TUTORIAL_MAPPING[relativePath]) {
      setCurrentTutorial(TUTORIAL_MAPPING[relativePath]);
    } else {
      setCurrentTutorial(null);
    }
  }, [pathname]);

  if (!currentTutorial) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors px-2"
      asChild
    >
      <a
        href={`${LANDING_PAGE_URL}/tutorials/${currentTutorial.slug}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Como funciona este recurso?</span>
        <span className="sm:hidden">Ajuda</span>
        <ExternalLink className="h-3 w-3 opacity-50" />
      </a>
    </Button>
  );
}

/**
 * TutorialReminder:
 * Balão de ajuda que aparece no canto inferior direito.
 * Oculto em mobile e auto-dismiss após 10 segundos.
 */
export function TutorialReminder() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [currentTutorial, setCurrentTutorial] = useState<{
    slug: string;
    title: string;
  } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Verifica se o tutorial já foi fechado para este path
  useEffect(() => {
    const dismissed = localStorage.getItem(`tutorial_dismissed_${pathname}`);
    if (dismissed) {
      setIsDismissed(true);
    } else {
      setIsDismissed(false);
    }
  }, [pathname]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem(`tutorial_dismissed_${pathname}`, "true");
  };

  useEffect(() => {
    if (isDismissed) {
      setIsVisible(false);
      return;
    }

    const dashboardMatch = pathname?.match(/\/dashboard(\/.*)?$/);
    const relativePath = dashboardMatch ? dashboardMatch[1] || "/" : null;

    if (relativePath && TUTORIAL_MAPPING[relativePath]) {
      setCurrentTutorial(TUTORIAL_MAPPING[relativePath]);
      
      // Delay inicial
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000); // 5 segundos para o usuário se situar na página

      // Auto-hide após 12 segundos (total 17s na página)
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 15000);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    } else {
      setIsVisible(false);
      setCurrentTutorial(null);
    }
  }, [pathname, isDismissed]);

  if (!currentTutorial || isDismissed) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 right-4 z-40 transition-all duration-700 transform",
        "hidden md:block", // OCULTAR EM MOBILE para não atrapalhar a visão
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      )}
    >
      <div className="bg-card border border-border shadow-2xl rounded-2xl p-4 max-w-70 group animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 shadow-sm hover:bg-accent transition-colors"
        >
          <X className="h-3 w-3" />
        </button>

        <div className="flex gap-4 items-start">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <h4 className="text-sm font-semibold leading-none text-foreground">Dica rápida</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sabia que temos um tutorial de <span className="font-medium text-foreground">{currentTutorial.title}</span> para te ajudar?
            </p>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary font-bold text-xs"
              asChild
            >
              <a
                href={`${LANDING_PAGE_URL}/tutorials/${currentTutorial.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver tutorial completo →
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
