"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  LogOut,
  Users,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MasterNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface MasterNavGroup {
  group: string;
  items: MasterNavItem[];
}

const MASTER_NAVIGATION: MasterNavGroup[] = [
  {
    group: "Administração Global",
    items: [
      {
        title: "Usuários (Estúdios)",
        href: "/admin/master",
        icon: Users,
      },
      {
        title: "Relatórios",
        href: "/admin/master/relatorios",
        icon: BarChart3,
      },
    ],
  },
];

interface MasterSidebarProps {
  adminUser: { name: string; username: string } | null;
  handleLogout: () => void;
}

export function MasterSidebar({ adminUser, handleLogout }: MasterSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin/master" && pathname === "/admin/master") return true;
    if (path !== "/admin/master" && pathname?.includes(path)) return true;
    return false;
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
              {adminUser?.name || "Super Admin"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {adminUser?.username || "master"}
            </p>
          </div>
        </div>
        <div className="px-2">
           <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Master Access
          </span>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {MASTER_NAVIGATION.map((group) => (
          <div key={group.group} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">
              {group.group}
            </p>
            {group.items.map((item) => {
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
