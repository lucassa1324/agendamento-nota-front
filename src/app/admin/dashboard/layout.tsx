"use client";

import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  CalendarIcon,
  Clock,
  Home,
  ImageIcon,
  LogOut,
  Package,
  PieChart,
  Plug,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { checkAdminAuth, getAdminUser, logoutAdmin } from "@/lib/admin-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
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
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Agendamentos
          </Link>
          <Link
            href="/admin/dashboard?tab=servicos"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            Serviços
          </Link>
          <Link
            href="/admin/dashboard?tab=horarios"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Clock className="w-4 h-4" />
            Horários
          </Link>
          <Link
            href="/admin/dashboard?tab=integracoes"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Plug className="w-4 h-4" />
            Integrações
          </Link>
          <Link
            href="/admin/dashboard?tab=perfil"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
            Perfil
          </Link>
          <Link
            href="/admin/dashboard?tab=gerenciamento"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <PieChart className="w-4 h-4" />
            Gerenciamento
          </Link>
          <Link
            href="/admin/dashboard?tab=estoque"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Package className="w-4 h-4" />
            Estoque
          </Link>
          <Link
            href="/admin/dashboard?tab=google"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
            Google Calendar
          </Link>
          <Link
            href="/admin/dashboard?tab=notificacoes"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Bell className="w-4 h-4" />
            Notificações
          </Link>
          <Link
            href="/admin/dashboard?tab=galeria"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Galeria
          </Link>
          <Link
            href="/admin/dashboard?tab=relatorios"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
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
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
