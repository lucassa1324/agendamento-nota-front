import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResetSectionVisualsProps {
  onReset: () => void;
  label?: string;
  description?: string;
}

export function ResetSectionVisuals({ 
  onReset, 
  label = "Resetar Visual", 
  description = "Voltar para fundo branco e texto preto." 
}: ResetSectionVisualsProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50 mb-6 group hover:bg-muted/50 transition-colors">
      <div className="space-y-0.5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">{label}</h4>
        <p className="text-[10px] text-muted-foreground/60 leading-tight">{description}</p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onReset}
        className="gap-1.5 text-[10px] h-7 px-2.5 rounded-lg border-border/60 hover:border-primary/50 hover:text-primary transition-all"
      >
        <RotateCcw className="w-3 h-3" />
        Resetar
      </Button>
    </div>
  );
}
