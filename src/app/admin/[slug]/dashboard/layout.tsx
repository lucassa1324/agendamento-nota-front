"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, Suspense, use, useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarProvider } from "@/context/sidebar-context";
import { StudioProvider } from "@/context/studio-context";
import {
  API_BASE_URL,
  getSession,
  signOut,
  useSession,
} from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function MobileNav({
  isPersonalizacao,
  adminUser,
  handleLogout,
}: {
  isPersonalizacao: boolean;
  adminUser: { name: string; username: string } | null;
  handleLogout: () => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
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
        <AdminSidebar adminUser={adminUser} handleLogout={handleLogout} />
      </SheetContent>
    </Sheet>
  );
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [adminUser, setAdminUser] = useState<{
    username: string;
    name: string;
  } | null>(null);

  useEffect(() => {
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

          const diagRes = await fetch(`${API_BASE_URL}/diagnostics/headers`, {
            credentials: "include",
          });
          if (diagRes.ok) {
            const diagData = await diagRes.json();
            console.log(
              ">>> [DASHBOARD_LAYOUT] Diagnóstico do Backend:",
              diagData,
            );
          }
        } catch (e) {
          console.warn(
            ">>> [ADMIN_WARN] Erro ao buscar diagnóstico:",
            e,
          );
        }
      };

      if (!session) {
        checkBackendAuth();
        // Pequeno delay para evitar falsos negativos em transições rápidas
        const timer = setTimeout(() => {
          console.warn(
            ">>> [DASHBOARD_LAYOUT] Redirecionando por falta de sessão.",
          );
          router.push("/admin");
        }, 1000); // Aumentado para 1s para dar mais tempo ao diagnóstico
        return () => clearTimeout(timer);
      }

      interface AuthUser {
        name: string;
        email: string;
        slug?: string;
        business?: {
          slug?: string;
        };
      }

      const user = session.user as AuthUser;
      const businessSlug = user?.business?.slug || user?.slug;

      if (businessSlug && businessSlug !== slug) {
        console.warn(
          `>>> [DASHBOARD_LAYOUT] Acesso negado. Redirecionando para o slug correto: ${businessSlug}`,
        );
        router.push(`/admin/${businessSlug}/dashboard/overview`);
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
  }, [session, isLoadingSession, slug, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/admin");
  };

  const isPersonalizacao = pathname?.includes("/personalizacao");

  // Enquanto estiver carregando ou validando, mostra o loading
  if (isLoadingSession || isCheckingSession || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Botão Mobile para abrir Sidebar */}
      <div className="lg:hidden p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
        <Link
          href={`/admin/${slug}/dashboard/overview`}
          className="font-serif font-bold text-primary"
        >
          Brow Studio
        </Link>
        <MobileNav
          isPersonalizacao={isPersonalizacao}
          adminUser={adminUser}
          handleLogout={handleLogout}
        />
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden lg:block">
        <AdminSidebar adminUser={adminUser} handleLogout={handleLogout} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main
          className={cn(
            "flex-1 flex flex-col",
            isPersonalizacao ? "p-0" : "p-4 lg:p-6",
          )}
        >
          {/* Botão Sanduíche para Personalização (Mobile) */}
          {isPersonalizacao && (
            <div className="absolute top-4 left-4 z-50 lg:hidden">
              <MobileNav
                isPersonalizacao={isPersonalizacao}
                adminUser={adminUser}
                handleLogout={handleLogout}
              />
            </div>
          )}
          {children}
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

  // Mover o check de autenticação para o topo se possível, ou garantir que hooks sejam estáveis
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      }
    >
      <StudioProvider initialSlug={slug}>
        <SidebarProvider>
          <AdminLayoutContent slug={slug}>{children}</AdminLayoutContent>
        </SidebarProvider>
      </StudioProvider>
    </Suspense>
  );
}
