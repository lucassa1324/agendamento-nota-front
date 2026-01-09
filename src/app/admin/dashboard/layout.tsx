"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { Suspense, useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarProvider } from "@/context/sidebar-context";
import { getSession, logout } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

  const isPersonalizacao = pathname?.includes("/personalizacao");

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-10 w-10",
            isPersonalizacao ? "bg-background/80 backdrop-blur-sm" : ""
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

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Botão Mobile para abrir Sidebar */}
      <div className="lg:hidden p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
        <Link
          href="/admin/dashboard"
          className="font-serif font-bold text-primary"
        >
          Brow Studio
        </Link>
        <MobileNav />
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
            isPersonalizacao ? "p-0" : "p-4 lg:p-6"
          )}
        >
          {/* Botão Sanduíche para Personalização (Mobile) */}
          {isPersonalizacao && (
            <div className="absolute top-4 left-4 z-50 lg:hidden">
              <MobileNav />
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
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SidebarProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SidebarProvider>
    </Suspense>
  );
}
