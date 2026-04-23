"use client";

import { Menu } from "lucide-react";
import { Nunito } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, Suspense, use, useEffect, useRef, useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { BackendTrigger } from "@/components/admin/BackendTrigger";
import { SubscriptionBlockScreen } from "@/components/admin/subscription-block-screen";
import { TrialBanner } from "@/components/admin/trial-banner";
import { TutorialReminder } from "@/components/admin/tutorial-reminder";
import { FeedbackWidget } from "@/components/feedback-widget";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarProvider } from "@/context/sidebar-context";
import { StudioProvider, useStudio } from "@/context/studio-context";
import { getSession, signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const dashboardRoundedFont = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-dashboard-rounded",
  display: "swap",
});

function MobileNav({
  isPersonalizacao,
  adminUser,
  handleLogout,
}: {
  isPersonalizacao: boolean;
  adminUser: { name: string; username: string } | null;
  handleLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          id="mobile-menu-btn"
          variant="outline"
          size="icon"
          className={cn(
            "h-10 w-10",
            isPersonalizacao ? "bg-background/80 backdrop-blur-sm" : "",
          )}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 border-r-0">
        <SheetTitle className="hidden">Menu de Navegação</SheetTitle>
        <AdminSidebar
          adminUser={adminUser}
          handleLogout={handleLogout}
          onClose={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

interface AuthUser {
  name: string;
  email: string;
  slug?: string;
  role?: string;
  emailVerified?: boolean;
  business?: {
    id?: string;
    slug?: string;
    subscriptionStatus?: string;
  };
  businessId?: string;
}

function AdminLayoutContent({
  children,
  slug: propSlug,
}: {
  children: ReactNode;
  slug: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const slug = propSlug;

  const { data: session, isPending: isLoadingSession } = useSession();
  const user = session?.user as AuthUser | undefined;
  const businessId = user?.business?.id || user?.businessId;

  const {
    studio,
    isLoading: isLoadingStudio,
    error: studioError,
    setBusinessId: setRootBusinessId,
    businessId: currentBusinessId,
  } = useStudio();

  // Sincroniza o businessId da sessão com o StudioProvider raiz se necessário
  useEffect(() => {
    if (businessId && businessId !== currentBusinessId) {
      console.log(">>> [DASHBOARD_LAYOUT] Sincronizando businessId com Provider raiz:", businessId);
      setRootBusinessId(businessId);
    }
  }, [businessId, currentBusinessId, setRootBusinessId]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [adminUser, setAdminUser] = useState<{
    username: string;
    name: string;
  } | null>(null);
  const [billingRequiredDetected, setBillingRequiredDetected] = useState(false);
  const isOnboarding = pathname?.includes("/dashboard/onboarding");
  const redirectInFlightRef = useRef<string | null>(null);

  const safeRedirect = (targetPath: string) => {
    if (!targetPath || pathname === targetPath) return;
    if (redirectInFlightRef.current === targetPath) return;
    redirectInFlightRef.current = targetPath;
    router.replace(targetPath);
  };

  useEffect(() => {
    let cancelled = false;
    let sessionFallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const runAccessValidation = async () => {
      // Só age quando o loading inicial do better-auth terminar
      if (!isLoadingSession) {
        console.log(">>> [DASHBOARD_LAYOUT] Estado da sessão:", {
          hasSession: !!session,
          sessionData: session,
          currentSlug: slug,
        });

        // Diagnóstico adicional: verifica se os cookies estão sendo enviados para o backend
        const checkBackendAuth = async () => {
          try {
            console.log(">>> [DASHBOARD_LAYOUT] Tentando getSession() manual...");
            const manualSession = await getSession();
            console.log(
              ">>> [DASHBOARD_LAYOUT] Resultado getSession() manual:",
              manualSession,
            );

            // Usando customFetch para o diagnóstico
            // Comentado para evitar erros de console quando o backend está offline
            /* 
            const diagRes = await customFetch(
              `${API_BASE_URL}/diagnostics/headers`,
              {
                credentials: "include",
              },
            );
            if (diagRes.ok) {
              const diagData = await diagRes.json();
              console.log(
                ">>> [DASHBOARD_LAYOUT] Diagnóstico do Backend:",
                diagData,
              );
            }
            */
          } catch (e) {
            console.warn(">>> [ADMIN_WARN] Erro ao buscar diagnóstico:", e);
          }
        };

        if (!session) {
          checkBackendAuth();
          // Pequeno delay para evitar falsos negativos em transições rápidas
          sessionFallbackTimer = setTimeout(() => {
            if (cancelled) return;
            console.warn(
              ">>> [DASHBOARD_LAYOUT] Redirecionando por falta de sessão.",
            );
            safeRedirect("/admin");
          }, 1000); // Aumentado para 1s para dar mais tempo ao diagnóstico
          return;
        }

        let user = session.user as AuthUser;

        // PROTEÇÃO CONTRA UNDEFINED: Garante que user existe antes de acessar propriedades
        if (!user) {
          console.warn(
            ">>> [DASHBOARD_LAYOUT] Sessão existe mas usuário é undefined.",
          );
          safeRedirect("/admin");
          return;
        }

        // NOVO: BLOQUEIO DE E-MAIL NÃO VERIFICADO
        // Bloqueamos acesso ao dashboard se o e-mail não estiver verificado
        // Exceção: Super Admin ou e-mail do proprietário
        if (
          user.emailVerified === false &&
          user.role !== "SUPER_ADMIN" &&
          user.email !== "lucassa1324@gmail.com"
        ) {
          try {
            const latestSession = await getSession();
            const latestUser = latestSession?.data?.user as AuthUser | undefined;

            if (latestUser?.emailVerified) {
              console.log(
                ">>> [DASHBOARD_LAYOUT] Sessão atualizada detectou e-mail verificado. Prosseguindo no dashboard.",
              );
              user = {
                ...user,
                ...latestUser,
                business: latestUser.business || user.business,
              };
            } else {
              console.warn(
                ">>> [DASHBOARD_LAYOUT] E-mail não verificado. Bloqueando acesso ao dashboard.",
              );
              localStorage.setItem("pending_verification_email", user.email || "");
              safeRedirect("/admin/pending-verification");
              return;
            }
          } catch {
            // Em caso de falha de rede, mantém comportamento seguro e evita liberar dashboard indevidamente
            localStorage.setItem("pending_verification_email", user.email || "");
            safeRedirect("/admin/pending-verification");
            return;
          }
        }

        // Se for um Super Admin tentando acessar um dashboard de estúdio, permitimos?
        // Pela regra de negócio, o Super Admin deve ir para /admin/master.
        if (user.role === "SUPER_ADMIN") {
          console.warn(
            ">>> [DASHBOARD_LAYOUT] Super Admin acessando rota de estúdio. Redirecionando para Master.",
          );
          safeRedirect("/admin/master");
          return;
        }

        const businessSlug = user?.business?.slug || user?.slug;

        const hasCompletedOnboarding = Boolean(
          (session.user as { hasCompletedOnboarding?: boolean })
            ?.hasCompletedOnboarding,
        );

        if (!hasCompletedOnboarding && !isOnboarding && businessSlug) {
          safeRedirect(`/admin/${businessSlug}/dashboard/onboarding`);
          return;
        }

        if (hasCompletedOnboarding && isOnboarding && businessSlug) {
          safeRedirect(`/admin/${businessSlug}/dashboard/overview`);
          return;
        }

        if (businessSlug && businessSlug !== slug) {
          console.warn(
            `>>> [DASHBOARD_LAYOUT] Acesso negado. Redirecionando para o slug correto: ${businessSlug}`,
          );
          safeRedirect(`/admin/${businessSlug}/dashboard/overview`);
          return;
        }

        console.log(">>> [DASHBOARD_LAYOUT] Sessão validada com sucesso.");
        setIsAuthenticated(true);
        setAdminUser({
          name: user.name || "Administrador",
          username: user.email,
        });
        setIsCheckingSession(false);
      }
    };

    runAccessValidation();

    return () => {
      cancelled = true;
      if (sessionFallbackTimer) {
        clearTimeout(sessionFallbackTimer);
      }
    };
  }, [session, isLoadingSession, slug, isOnboarding]);

  useEffect(() => {
    if (!isLoadingSession) return;

    const timeoutId = setTimeout(() => {
      console.warn(
        ">>> [DASHBOARD_LAYOUT] Timeout ao validar sessão. Redirecionando para login.",
      );
      safeRedirect("/admin");
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [isLoadingSession]);

  const handleLogout = async () => {
    await signOut();
    window.location.assign("/admin");
  };

  const isPersonalizacao = pathname?.includes("/personalizacao");
  const isMaster = pathname?.startsWith("/admin/master");
  const isMinhaConta = pathname?.includes("/dashboard/minha-conta");

  // Tratamento de erro de carregamento do estúdio
  // EXCEÇÃO: Se for erro 402 (Pagamento Necessário), deixamos o layout renderizar para mostrar a tela de bloqueio com link de pagamento
  const isBillingError = studioError?.includes("(402)");

  const subscriptionStatus =
    user?.business?.subscriptionStatus ||
    studio?.subscriptionStatus ||
    (isBillingError ? "past_due" : undefined);

  const isSubscriptionBlocked =
    subscriptionStatus === "past_due" ||
    subscriptionStatus === "unpaid" ||
    subscriptionStatus === "canceled";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleBillingRequired = () => {
      setBillingRequiredDetected(true);
    };
    window.addEventListener("billing-required", handleBillingRequired);
    return () => {
      window.removeEventListener("billing-required", handleBillingRequired);
    };
  }, []);

  useEffect(() => {
    if (isMinhaConta || !isSubscriptionBlocked) {
      setBillingRequiredDetected(false);
    }
  }, [isMinhaConta, isSubscriptionBlocked]);

  const shouldBlockAccess =
    !isMinhaConta && (isSubscriptionBlocked || billingRequiredDetected);
  const blockStatus = subscriptionStatus || "past_due";

  if (studioError && !isMaster && !isBillingError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">
          Erro ao carregar estúdio
        </h2>
        <p className="text-muted-foreground mb-6">
          {studioError === "Studio não encontrado"
            ? "O estúdio especificado na URL não foi encontrado."
            : `Houve um problema ao carregar os dados: ${studioError}`}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Enquanto estiver carregando ou validando, mostra o loading
  // Também aguarda o carregamento do estúdio (exceto para rota master)
  if (
    isLoadingSession ||
    isCheckingSession ||
    !isAuthenticated ||
    (isLoadingStudio && !isMaster)
  ) {
    return (
      <div
        className={`${dashboardRoundedFont.variable} dashboard-rounded-headings min-h-screen flex items-center justify-center bg-background`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse">
            Verificando acesso...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${dashboardRoundedFont.variable} dashboard-rounded-headings min-h-screen bg-background flex flex-col lg:flex-row`}
    >
      {!isPersonalizacao && (
        <div className="lg:hidden p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
          <div />
          <MobileNav
            isPersonalizacao={isPersonalizacao}
            adminUser={adminUser}
            handleLogout={handleLogout}
          />
        </div>
      )}

      {/* Sidebar Desktop */}
      {!isPersonalizacao && (
        <div className="hidden lg:block shrink-0">
          <AdminSidebar adminUser={adminUser} handleLogout={handleLogout} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main
          className={cn(
            "flex-1 flex flex-col",
            isPersonalizacao ? "p-0 h-dvh overflow-hidden" : "p-4 lg:p-6",
          )}
        >
          <BackendTrigger />
          <TrialBanner />
          <TutorialReminder />
          {shouldBlockAccess ? (
            <SubscriptionBlockScreen status={blockStatus} />
          ) : (
            children
          )}
          {!isPersonalizacao && <FeedbackWidget />}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
  params: paramsPromise,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(paramsPromise);
  const { data: session } = useSession();
  const user = session?.user as AuthUser | undefined;
  const businessId = user?.business?.id || user?.businessId;

  // Mover o check de autenticação para o topo se possível, ou garantir que hooks sejam estáveis
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      }
    >
      <SidebarProvider>
        <AdminLayoutContent slug={slug}>{children}</AdminLayoutContent>
      </SidebarProvider>
    </Suspense>
  );
}
