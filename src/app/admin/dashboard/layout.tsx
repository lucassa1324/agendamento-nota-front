"use client";

import {
  BarChart3,
  Bell,
  Briefcase,
  CalendarIcon,
  Clock,
  ExternalLink,
  ImageIcon,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Package,
  Palette,
  PieChart,
  Plug,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarProvider } from "@/context/sidebar-context";
import { checkAdminAuth, getAdminUser, logoutAdmin } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

const Sidebar = ({
  adminUser,
  handleLogout,
}: {
  adminUser: { name: string; username: string } | null;
  handleLogout: () => void;
}) => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname?.includes(path);

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen lg:sticky lg:top-0 z-50 shadow-xl">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">
              {adminUser?.name || "Administrador"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{adminUser?.username || "admin"}
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors group"
        >
          <ExternalLink className="w-4 h-4 group-hover:text-primary transition-colors" />
          Ir para o site
        </Link>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Grupo: Operacional */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">
            Operacional
          </p>
          <Link
            href="/admin/dashboard/overview"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/overview")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Visão Geral
          </Link>
          <Link
            href="/admin/dashboard/agendamentos"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/agendamentos")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <ListTodo className="w-4 h-4" />
            Agendamentos
          </Link>
          <Link
            href="/admin/dashboard/calendario"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/calendario")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendário Admin
          </Link>
          <Link
            href="/admin/dashboard/servicos"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/servicos")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Briefcase className="w-4 h-4" />
            Serviços
          </Link>
          <Link
            href="/admin/dashboard/horarios"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/horarios")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Clock className="w-4 h-4" />
            Horários
          </Link>
        </div>

        {/* Grupo: Administrativo */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">
            Administrativo
          </p>
          <Link
            href="/admin/dashboard/gerenciamento"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/gerenciamento")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <PieChart className="w-4 h-4" />
            Gerenciamento
          </Link>
          <Link
            href="/admin/dashboard/estoque"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/estoque")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Package className="w-4 h-4" />
            Estoque
          </Link>
          <Link
            href="/admin/dashboard/relatorios"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/relatorios")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <BarChart3 className="w-4 h-4" />
            Relatórios
          </Link>
        </div>

        {/* Grupo: Integrações */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">
            Integrações
          </p>
          <Link
            href="/admin/dashboard/integracoes"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/integracoes")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Plug className="w-4 h-4" />
            Integrações
          </Link>
          <Link
            href="/admin/dashboard/google"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/google")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            Google Calendar
          </Link>
          <Link
            href="/admin/dashboard/notificacoes"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/notificacoes")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Bell className="w-4 h-4" />
            Notificações
          </Link>
        </div>

        {/* Grupo: Perfil e Aparência */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">
            Configurações e Site
          </p>
          <Link
            href="/admin/dashboard/perfil"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/perfil")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Briefcase className="w-4 h-4" />
            Dados da Empresa
          </Link>
          <Link
            href="/admin/dashboard/minha-conta"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/minha-conta")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <User className="w-4 h-4" />
            Minha Conta
          </Link>
          <Link
            href="/admin/dashboard/personalizacao"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/personalizacao")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Palette className="w-4 h-4" />
            Personalização
          </Link>
          <Link
            href="/admin/dashboard/galeria"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/admin/dashboard/galeria")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <ImageIcon className="w-4 h-4" />
            Galeria
          </Link>
        </div>

        {/* Sair do Painel */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair do Painel
          </Button>
        </div>
      </nav>
    </aside>
  );
};

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
    const authenticated = checkAdminAuth();
    if (!authenticated) {
      router.push("/admin");
    } else {
      setIsAuthenticated(true);
      setAdminUser(getAdminUser());
    }
    setIsLoading(false);

    const handleStorageChange = (e?: Event) => {
      if (!e || e.type === "storage" || e.type === "adminProfileUpdated") {
        setAdminUser(getAdminUser());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("adminProfileUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("adminProfileUpdated", handleStorageChange);
    };
  }, [router]);

  const handleLogout = () => {
    logoutAdmin();
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

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Botão Mobile para abrir Sidebar */}
      <div className="lg:hidden p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
        <Link href="/admin/dashboard" className="font-serif font-bold text-primary">
          Brow Studio
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <Sidebar
              adminUser={adminUser}
              handleLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden lg:block">
        <Sidebar
          adminUser={adminUser}
          handleLogout={handleLogout}
        />
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
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 bg-background/80 backdrop-blur-sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 border-r-0">
                  <Sidebar
                    adminUser={adminUser}
                    handleLogout={handleLogout}
                  />
                </SheetContent>
              </Sheet>
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
