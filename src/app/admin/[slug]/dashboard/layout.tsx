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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await getSession();
        if (!sessionData) {
          router.push("/admin");
        } else {
          // Salvar ID do usuário para isolamento de dados no LocalStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("current_admin_id", sessionData.user.id);
          }

          setIsAuthenticated(true);
          setAdminUser({
            name: sessionData.user.name || "Administrador",
            username: sessionData.user.email,
          });
        }
      } catch (error) {
        console.error("Session check failed", error);
        router.push("/admin");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("current_admin_id");
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
