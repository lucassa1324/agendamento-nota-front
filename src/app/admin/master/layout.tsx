"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MasterSidebar } from "@/components/admin/master-sidebar";
import { signOut, useSession } from "@/lib/auth-client";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Isola completamente o painel master de qualquer contexto de estúdio anterior
    if (typeof window !== "undefined") {
      console.log(">>> [MASTER_LAYOUT] Isolando contexto do Painel Master...");
    }

    if (!isPending) {
      if (!session) {
        console.warn(">>> [MASTER_LAYOUT] Sem sessão ativa. Redirecionando para login.");
        router.push("/admin");
        return;
      }

      const user = session.user as { role?: string; email?: string };
      
      // Validação rigorosa de Super Admin
      if (user.role !== "SUPER_ADMIN" && user.email !== "lucassa1324@gmail.com") {
        console.error(">>> [MASTER_LAYOUT] Acesso negado. Usuário não é SUPER_ADMIN:", user.email);
        router.push("/admin"); // Redireciona para o login administrativo comum
        return;
      }

      setIsAuthorized(true);
    }
  }, [session, isPending, router]);

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
    name: session?.user.name || "Super Admin",
    username: session?.user.email || "master",
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col lg:flex-row z-9999 overflow-hidden">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block h-full w-64 shrink-0 border-r bg-white shadow-sm">
        <MasterSidebar adminUser={adminUser} handleLogout={handleLogout} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
