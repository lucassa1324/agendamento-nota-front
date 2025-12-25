/** biome-ignore-all lint/a11y/useSemanticElements: Interface administrativa com elementos interativos complexos */
"use client";

import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff, Minus, Plus } from "lucide-react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Page {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  hidden?: boolean;
}

interface Section {
  id: string;
  name: string;
  description: string;
}

interface SidebarNavProps {
  pages: Page[];
  sections: Record<string, Section[]>;
  activePage: string;
  activeSection: string | null;
  expandedPages: string[];
  visibleSections: Record<string, boolean>;
  onPageToggle: (id: string) => void;
  onSectionSelect: (id: string) => void;
  onSectionVisibilityToggle: (id: string) => void;
  pageVisibility: Record<string, boolean>;
  onPageVisibilityChange: (pageId: string, isVisible: boolean) => void;
}

export function SidebarNav({
  pages,
  sections,
  activePage,
  activeSection,
  expandedPages,
  visibleSections,
  onPageToggle,
  onSectionSelect,
  onSectionVisibilityToggle,
  pageVisibility,
  onPageVisibilityChange,
}: SidebarNavProps) {
  return (
    <div className="space-y-4">
      {pages.map((page) => {
        const isExpanded = expandedPages.includes(page.id);
        const isActive = activePage === page.id;
        const isPageVisible = pageVisibility[page.id] !== false;

        return (
          <div
            key={page.id}
            className={cn(
              "flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden",
              isActive
                ? "border-primary/30 bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-border/80",
            )}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => onPageToggle(page.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPageToggle(page.id);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 xl:px-5 py-3 xl:py-4 transition-all duration-300 group cursor-pointer",
                isActive ? "text-primary" : "text-foreground",
              )}
            >
              <div className="flex items-center gap-2 xl:gap-4">
                <div
                  className={cn(
                    "p-2 xl:p-2.5 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80",
                  )}
                >
                  <page.icon className="w-4 h-4 xl:w-5 xl:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-bold text-xs xl:text-sm 2xl:text-base leading-tight truncate">
                    {page.label}
                  </span>
                  <span className="text-[8px] xl:text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                    {sections[page.id]?.length || 0} Seções
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 xl:gap-3">
                {page.id !== "layout" && page.id !== "inicio" && (
                  <Switch
                    checked={isPageVisible}
                    onCheckedChange={(checked: boolean) =>
                      onPageVisibilityChange(page.id, checked)
                    }
                    className="scale-75 xl:scale-100"
                    onClick={(e: MouseEvent) => e.stopPropagation()} // Evita que o clique no switch expanda/contraia a página
                  />
                )}
                <div
                  className={cn(
                    "flex items-center justify-center w-7 h-7 xl:w-8 xl:h-8 rounded-full border-2 transition-all duration-300",
                    isExpanded
                      ? "bg-primary/10 border-primary text-primary rotate-180"
                      : "bg-muted/50 border-transparent text-muted-foreground",
                  )}
                >
                  {isExpanded ? (
                    <Minus className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  )}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="px-2 xl:px-3 pb-3 xl:pb-4 space-y-1.5 xl:space-y-2 animate-in slide-in-from-top-4 duration-300">
                <div className="h-px bg-border/50 mx-2 mb-2 xl:mb-3" />
                <div className="grid gap-1 xl:gap-1.5">
                  {sections[page.id]?.map((section) => {
                    const isSectionActive = activeSection === section.id;
                    const isVisible = visibleSections[section.id] !== false;

                    return (
                      <div
                        key={section.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSectionSelect(section.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSectionSelect(section.id);
                          }
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 xl:px-4 py-2 xl:py-3 rounded-xl text-xs xl:text-sm transition-all group relative overflow-hidden cursor-pointer",
                          isSectionActive
                            ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/10"
                            : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                        )}
                      >
                        <div className="flex items-center gap-2 xl:gap-3 relative z-10">
                          <div
                            className={cn(
                              "w-1 h-1 xl:w-1.5 xl:h-1.5 rounded-full transition-all duration-500",
                              isVisible
                                ? "bg-emerald-500"
                                : "bg-destructive/50",
                            )}
                          />
                          <span className="truncate max-w-25 xl:max-w-none text-[10px] xl:text-xs">
                            {section.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5 xl:gap-1 relative z-10">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-6 w-6 xl:h-7 xl:w-7 rounded-lg transition-all",
                              isSectionActive
                                ? "text-primary-foreground hover:bg-white/20"
                                : "text-muted-foreground hover:bg-background/80",
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSectionVisibilityToggle(section.id);
                            }}
                          >
                            {isVisible ? (
                              <Eye className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                            )}
                          </Button>
                        </div>

                        {isSectionActive && (
                          <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-transparent pointer-events-none" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
