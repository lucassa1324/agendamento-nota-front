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
import { getSession, logout } from "@/lib/auth-client";
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
  // Se já temos o slug via prop, não precisamos do useParams aqui
  const slug = propSlug;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{
    username: string;
    name: string;
  } | null>(null);

  console.log(
    ">>> [DASHBOARD_LAYOUT] Renderizando AdminLayoutContent. Estado:",
    {
      isAuthenticated,
      isLoading,
      slug,
    },
  );

  useEffect(() => {
    // Timeout de segurança: se após 5 segundos a sessão não responder, libera o loading
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn(
          ">>> [DASHBOARD_LAYOUT] Timeout de segurança atingido (5s). Forçando isLoading -> false",
        );
        setIsLoading(false);
      }
    }, 5000);

    const checkSession = async () => {
      try {
        console.log(">>> [DASHBOARD_LAYOUT] checkSession iniciada.");
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token")
            : undefined;

        const sessionData = await getSession(token || undefined);
        console.log(">>> [DASHBOARD_LAYOUT] Resposta recebida:", !!sessionData);

        const user =
          sessionData?.user ||
          sessionData?.data?.user ||
          sessionData?.session?.user ||
          (sessionData?.email ? sessionData : null);

        if (!sessionData || !user) {
          console.warn(
            ">>> [DASHBOARD_LAYOUT] Sessão não encontrada no primeiro check. Re-tentando em 1s...",
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const secondCheck = await getSession(token || undefined);
          const secondUser =
            secondCheck?.user ||
            secondCheck?.data?.user ||
            secondCheck?.session?.user;

          if (secondCheck && secondUser) {
            console.log(">>> [DASHBOARD_LAYOUT] Sessão recuperada.");
            setIsAuthenticated(true);
            setAdminUser({
              name: secondUser.name || "Administrador",
              username: secondUser.email,
            });
          } else {
            console.error(">>> [DASHBOARD_LAYOUT] Sessão realmente inválida.");
            router.push("/admin");
          }
        } else {
          console.log(">>> [DASHBOARD_LAYOUT] Sessão válida encontrada.");
          if (typeof window !== "undefined" && user.id) {
            localStorage.setItem("current_admin_id", user.id);
          }

          setIsAuthenticated(true);
          setAdminUser({
            name: user.name || "Administrador",
            username: user.email,
          });
        }
      } catch (error) {
        console.error(">>> [DASHBOARD_LAYOUT] Erro no checkSession:", error);
        router.push("/admin");
      } finally {
        setIsLoading(false);
        clearTimeout(safetyTimeout);
        console.log(">>> [DASHBOARD_LAYOUT] checkSession finalizada.");
      }
    };

    checkSession();
    return () => clearTimeout(safetyTimeout);
  }, [router, isLoading]);

  const handleLogout = async () => {
    await logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("current_admin_id");
      localStorage.removeItem("auth_token");
    }
    router.push("/admin");
  };

  const isPersonalizacao = pathname?.includes("/personalizacao");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
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
