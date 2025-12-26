"use client";

import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EDITOR_FONTS } from "./editor-constants";

interface SectionSubtitleEditorProps {
  subtitle: string;
  font: string;
  color: string;
  onUpdate: (updates: { subtitle?: string; font?: string; color?: string }) => void;
  label?: string;
}

export function SectionSubtitleEditor({
  subtitle,
  font,
  color,
  onUpdate,
  label = "Texto do Subtítulo",
}: SectionSubtitleEditorProps) {
  return (
    <div className="space-y-4 pt-2">
      <fieldset 
        className="space-y-1.5 border-none p-0 m-0" 
        onPointerDown={(e) => e.stopPropagation()} 
        onMouseDown={(e) => e.stopPropagation()} 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
          {label}
        </legend>
        <Textarea
          value={subtitle}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
          className="min-h-20 text-xs resize-none"
        />
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <fieldset 
          className="space-y-1.5 border-none p-0 m-0" 
          onPointerDown={(e) => e.stopPropagation()} 
          onMouseDown={(e) => e.stopPropagation()} 
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
            Fonte
          </legend>
          <Select
            value={font}
            onValueChange={(v) => onUpdate({ font: v })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Fonte" />
            </SelectTrigger>
            <SelectContent>
              {EDITOR_FONTS.map((f) => (
                <SelectItem
                  key={f.name}
                  value={f.name}
                  className="text-xs"
                >
                  <span style={{ fontFamily: f.name }}>{f.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </fieldset>
        <fieldset 
          className="space-y-1.5 border-none p-0 m-0" 
          onPointerDown={(e) => e.stopPropagation()} 
          onMouseDown={(e) => e.stopPropagation()} 
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5">
            Cor
          </legend>
          <div className="flex gap-2">
            <Input
              type="color"
              value={color || "#666666"}
              className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
              onChange={(e) => onUpdate({ color: e.target.value })}
            />
            <Input
              value={color || ""}
              placeholder="#HEX"
              className="h-8 text-[10px] flex-1 uppercase"
              onChange={(e) => onUpdate({ color: e.target.value })}
            />
          </div>
        </fieldset>
      </div>
    </div>
  );
}
