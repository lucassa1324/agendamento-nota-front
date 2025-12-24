"use client";

import {
  BarChart3,
  Bell,
  Briefcase,
  CalendarIcon,
  Clock,
  Home,
  ImageIcon,
  ListTodo,
  LogOut,
  Package,
  Palette,
  PieChart,
  Plug,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { checkAdminAuth, getAdminUser, logoutAdmin } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "agendamentos";
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

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border">
          <Link
            href="/admin/dashboard"
            className="font-serif text-xl font-bold text-primary block"
          >
            Brow Studio
          </Link>
          <p className="text-xs text-muted-foreground mt-1">
            Painel Administrativo
          </p>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin/dashboard?tab=agendamentos"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "agendamentos"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <ListTodo className="w-4 h-4" />
            Agendamentos
          </Link>
          <Link
            href="/admin/dashboard?tab=calendario"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "calendario"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendário Admin
          </Link>
          <Link
            href="/admin/dashboard?tab=servicos"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "servicos"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Briefcase className="w-4 h-4" />
            Serviços
          </Link>
          <Link
            href="/admin/dashboard?tab=horarios"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "horarios"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Clock className="w-4 h-4" />
            Horários
          </Link>
          <Link
            href="/admin/dashboard?tab=integracoes"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "integracoes"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Plug className="w-4 h-4" />
            Integrações
          </Link>
          <Link
            href="/admin/dashboard?tab=perfil"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "perfil"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Settings className="w-4 h-4" />
            Perfil
          </Link>
          <Link
            href="/admin/dashboard?tab=personalizacao"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "personalizacao"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Palette className="w-4 h-4" />
            Personalização
          </Link>
          <Link
            href="/admin/dashboard?tab=gerenciamento"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "gerenciamento"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <PieChart className="w-4 h-4" />
            Gerenciamento
          </Link>
          <Link
            href="/admin/dashboard?tab=estoque"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "estoque"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Package className="w-4 h-4" />
            Estoque
          </Link>
          <Link
            href="/admin/dashboard?tab=google"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "google"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            Google Calendar
          </Link>
          <Link
            href="/admin/dashboard?tab=notificacoes"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "notificacoes"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Bell className="w-4 h-4" />
            Notificações
          </Link>
          <Link
            href="/admin/dashboard?tab=galeria"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "galeria"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <ImageIcon className="w-4 h-4" />
            Galeria
          </Link>
          <Link
            href="/admin/dashboard?tab=relatorios"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "relatorios"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <BarChart3 className="w-4 h-4" />
            Relatórios
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border space-y-2">
          {adminUser && (
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{adminUser.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {adminUser.username}
                </p>
              </div>
            </div>
          )}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full justify-start bg-transparent"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Ver Site
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <h1 className="font-sans text-lg font-semibold">
            Dashboard Administrativo
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main
          className={cn(
            "flex-1 overflow-hidden flex flex-col",
            activeTab === "personalizacao" ? "p-0" : "p-6",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
