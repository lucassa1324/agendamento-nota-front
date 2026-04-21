"use client";

import { Loader2, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MasterSidebar } from "@/components/admin/master-sidebar";
import { FeedbackWidget } from "@/components/feedback-widget";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut, useSession } from "@/lib/auth-client";

export function MasterLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const hasRedirectedRef = useRef(false);

  const redirectToLogin = () => {
    if (hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;
    router.replace("/admin");

    // Fallback hard redirect para evitar spinner infinito
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = "/admin";
      }
    }, 120);
  };

  useEffect(() => {
    // Isola completamente o painel master de qualquer contexto de estúdio anterior
    if (typeof window !== "undefined") {
      console.log(">>> [MASTER_LAYOUT] Isolando contexto do Painel Master...");
    }

    if (!isPending) {
      if (!session) {
        console.warn(
          ">>> [MASTER_LAYOUT] Sem sessão ativa. Redirecionando para login.",
        );
        redirectToLogin();
        return;
      }

      const user = session.user as { role?: string; email?: string };

      if (!user) {
        console.warn(
          ">>> [MASTER_LAYOUT] Sessão existe mas usuário é undefined.",
        );
        redirectToLogin();
        return;
      }

      // Validação rigorosa de Super Admin
      if (
        user.role !== "SUPER_ADMIN" &&
        user.email !== "lucassa1324@gmail.com"
      ) {
        console.error(
          ">>> [MASTER_LAYOUT] Acesso negado. Usuário não é SUPER_ADMIN:",
          user.email,
        );
        redirectToLogin(); // Redireciona para o login administrativo comum
        return;
      }

      setIsAuthorized(true);
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!isPending) return;

    const timeoutId = setTimeout(() => {
      console.warn(
        ">>> [MASTER_LAYOUT] Timeout ao validar sessão. Redirecionando para login.",
      );
      redirectToLogin();
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [isPending]);

  const handleLogout = async () => {
    await signOut();
    router.push("/admin");
  };

  if (isPending || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const adminUser = {
    name: session?.user?.name || "Super Admin",
    username: session?.user?.email || "master",
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block h-full w-64 shrink-0 border-r bg-white shadow-sm">
        <MasterSidebar adminUser={adminUser} handleLogout={handleLogout} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white relative z-50">
          <span className="font-bold text-lg">Painel Master</span>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
              <SheetDescription className="sr-only">
                Menu de navegação lateral para acessar áreas administrativas
              </SheetDescription>
              <MasterSidebar
                adminUser={adminUser}
                handleLogout={handleLogout}
                onNavigate={() => setIsMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
          <FeedbackWidget />
        </main>
      </div>
    </div>
  );
}
