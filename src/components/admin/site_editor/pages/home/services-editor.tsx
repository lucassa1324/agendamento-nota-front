"use client";

import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ServicesEditorProps {
  hasChanges?: boolean;
  onSave?: () => void;
}

export function ServicesEditor({ hasChanges, onSave }: ServicesEditorProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="p-8 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <LayoutGrid className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-primary">Editor de Serviços</h4>
          <p className="text-xs text-muted-foreground max-w-50">
            Os controles para editar a seção "Nossos Serviços" estarão
            disponíveis aqui em breve.
          </p>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          disabled={!hasChanges}
          onClick={onSave}
          className={cn(
            "w-full h-11 text-sm font-bold transition-all duration-300",
            hasChanges
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
          )}
        >
          {hasChanges ? "Aplicar Alterações" : "Nenhuma alteração"}
        </Button>
      </div>
    </div>
  );
}
