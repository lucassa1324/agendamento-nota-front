import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface DashboardPageShellProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children: ReactNode;
  badge?: string;
}

export function DashboardPageShell({
  title,
  subtitle,
  icon: Icon,
  children,
  badge = "Módulo",
}: DashboardPageShellProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-border/60 bg-linear-to-r from-primary/10 via-background to-background p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-background/80 p-3 shadow-sm ring-1 ring-primary/15">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {badge}
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm backdrop-blur-sm sm:p-6">
        {children}
      </section>
    </div>
  );
}
