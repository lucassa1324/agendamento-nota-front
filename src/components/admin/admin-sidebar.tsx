"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  CalendarIcon,
  CalendarPlus,
  Clock,
  ExternalLink,
  Globe,
  ImageIcon,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Package,
  Palette,
  PieChart,
  Users,
  // Plug,
  User,
} from "lucide-react";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { PushNotificationsButton } from "@/components/admin/push-notifications-button";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/context/studio-context";
import { BASE_DOMAIN, LANDING_PAGE_URL, useSession } from "@/lib/auth-client";
import { cn, getFullImageUrl } from "@/lib/utils";

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
        title: "Encaminhamentos",
        href: "/admin/dashboard/encaminhamentos",
        icon: ArrowRightLeft,
      },
      {
        title: "Calendário",
        href: "/admin/dashboard/agenda",
        icon: CalendarDays,
      },
      {
        title: "Minha Agenda",
        href: "/admin/dashboard/my-agenda",
        icon: CalendarDays,
      },
      {
        title: "Novo Agendamento",
        href: "/admin/dashboard/calendario",
        icon: CalendarPlus,
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
      {
        title: "Time e Permissões",
        href: "/admin/dashboard/time",
        icon: Users,
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
      /*
      {
        title: "Integrações",
        href: "/admin/dashboard/integracoes",
        icon: Plug,
      },
      */
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
      {
        title: "Domínio Customizado",
        href: "/admin/dashboard/dns",
        icon: Globe,
      },
      { title: "Galeria", href: "/admin/dashboard/galeria", icon: ImageIcon },
    ],
  },
  {
    group: "Ajuda e Suporte",
    items: [
      {
        title: "Tutoriais",
        href: `${LANDING_PAGE_URL}/tutorials`,
        icon: BookOpen,
      },
    ],
  },
];

const STAFF_ALLOWED_PATHS = new Set([
  "/admin/dashboard/overview",
  "/admin/dashboard/my-agenda",
  "/admin/dashboard/minha-conta",
]);

interface AdminSidebarProps {
  adminUser: { name: string; username: string } | null;
  handleLogout: () => void;
  onClose?: () => void;
}

export function AdminSidebar({ adminUser, handleLogout, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const { studio } = useStudio();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role?.toLowerCase();
  const isStaffUser = role === "user";

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

  const visibleNavigation = ADMIN_NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      isStaffUser ? STAFF_ALLOWED_PATHS.has(item.href) : true,
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <aside className="w-64 bg-linear-to-b from-background via-background to-muted/20 border-r border-border/70 flex flex-col h-screen lg:sticky lg:top-0 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
      {studio?.logoUrl && (
        <div className="px-4 pt-4 pb-3 border-b border-border/60 flex justify-center items-center">
          <div className="relative w-full max-w-45 h-15 flex items-center justify-center rounded-xl bg-background/70 ring-1 ring-border/40">
            <Image
              src={getFullImageUrl(studio.logoUrl)}
              alt="Logo do Negócio"
              fill
              className="object-contain rounded-none p-2"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>
      )}

      <div className="p-4 border-b border-border/60 space-y-3">
        <div className="rounded-2xl bg-card/80 backdrop-blur-sm ring-1 ring-border/60 px-3 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 ring-1 ring-primary/20">
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
          </div>
        </div>

        <a
          href={getSiteUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground bg-muted/55 hover:bg-muted transition-colors group ring-1 ring-border/50"
        >
          <ExternalLink className="w-4 h-4 text-primary group-hover:scale-105 transition-transform" />
          Ir para o site
        </a>
        <PushNotificationsButton />
      </div>

      <nav className="flex-1 p-4 pb-24 space-y-5 overflow-y-auto">
        {visibleNavigation.map((group) => (
          <div key={group.group} className="space-y-1.5">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              {group.group}
            </p>
            {group.items.map((item) => {
              const dynamicHref = getDynamicHref(item.href);
              const isExternal = item.href.startsWith("http");

              const content = (
                <>
                  <item.icon className="w-4 h-4" />
                  {item.title}
                  {isExternal && <ExternalLink className="ml-auto w-3 h-3 opacity-50" />}
                </>
              );

              if (isExternal) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/90 hover:bg-muted/70 transition-colors"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <a
                  key={item.href}
                  href={dynamicHref}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground shadow-[0_6px_18px_rgba(119,82,83,0.35)]"
                      : "text-foreground/90 hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  {content}
                </a>
              );
            })}
            <div className="mt-3 h-px bg-linear-to-r from-transparent via-border/70 to-transparent" />
          </div>
        ))}

        <div className="pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 w-4 h-4" />
            Sair do Painel
          </Button>
        </div>
      </nav>
    </aside>
  );
}
