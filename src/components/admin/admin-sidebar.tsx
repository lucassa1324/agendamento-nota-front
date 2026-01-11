"use client";

import type { LucideIcon } from "lucide-react";
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
  Package,
  Palette,
  PieChart,
  Plug,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/context/studio-context";
import { BASE_DOMAIN } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface AdminNavGroup {
  group: string;
  items: AdminNavItem[];
}

const ADMIN_NAVIGATION: AdminNavGroup[] = [
  {
    group: "Operacional",
    items: [
      {
        title: "Visão Geral",
        href: "/admin/dashboard/overview",
        icon: LayoutDashboard,
      },
      {
        title: "Agendamentos",
        href: "/admin/dashboard/agendamentos",
        icon: ListTodo,
      },
      {
        title: "Calendário Admin",
        href: "/admin/dashboard/calendario",
        icon: CalendarIcon,
      },
      { title: "Serviços", href: "/admin/dashboard/servicos", icon: Briefcase },
      { title: "Horários", href: "/admin/dashboard/horarios", icon: Clock },
    ],
  },
  {
    group: "Administrativo",
    items: [
      {
        title: "Gerenciamento",
        href: "/admin/dashboard/gerenciamento",
        icon: PieChart,
      },
      { title: "Estoque", href: "/admin/dashboard/estoque", icon: Package },
      {
        title: "Relatórios",
        href: "/admin/dashboard/relatorios",
        icon: BarChart3,
      },
    ],
  },
  {
    group: "Integrações",
    items: [
      {
        title: "Integrações",
        href: "/admin/dashboard/integracoes",
        icon: Plug,
      },
      {
        title: "Google Calendar",
        href: "/admin/dashboard/google",
        icon: CalendarIcon,
      },
      {
        title: "Notificações",
        href: "/admin/dashboard/notificacoes",
        icon: Bell,
      },
    ],
  },
  {
    group: "Configurações e Site",
    items: [
      {
        title: "Dados da Empresa",
        href: "/admin/dashboard/perfil",
        icon: Briefcase,
      },
      {
        title: "Minha Conta",
        href: "/admin/dashboard/minha-conta",
        icon: User,
      },
      {
        title: "Personalização",
        href: "/admin/dashboard/personalizacao",
        icon: Palette,
      },
      { title: "Galeria", href: "/admin/dashboard/galeria", icon: ImageIcon },
    ],
  },
];

interface AdminSidebarProps {
  adminUser: { name: string; username: string } | null;
  handleLogout: () => void;
}

export function AdminSidebar({ adminUser, handleLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const { studio } = useStudio();

  const slug = (params?.slug as string) || studio?.slug || "";

  const isActive = (path: string) => pathname?.includes(path);

  const getDynamicHref = (href: string) => {
    if (slug) {
      return href.replace("/admin/dashboard", `/admin/${slug}/dashboard`);
    }
    return href;
  };

  const getSiteUrl = () => {
    if (!slug) return "/";
    if (typeof window !== "undefined") {
      const protocol = window.location.protocol;
      return `${protocol}//${slug}.${BASE_DOMAIN}`;
    }
    return `/${slug}`;
  };

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

        <a
          href={getSiteUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors group"
        >
          <ExternalLink className="w-4 h-4 group-hover:text-primary transition-colors" />
          Ir para o site
        </a>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {ADMIN_NAVIGATION.map((group) => (
          <div key={group.group} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">
              {group.group}
            </p>
            {group.items.map((item) => {
              const dynamicHref = getDynamicHref(item.href);
              return (
                <Link
                  key={item.href}
                  href={dynamicHref}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        ))}

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
}
