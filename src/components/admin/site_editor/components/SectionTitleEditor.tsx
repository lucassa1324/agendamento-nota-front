"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EDITOR_FONTS } from "./editor-constants";

interface SectionTitleEditorProps {
  title: string;
  font: string;
  color: string;
  onUpdate: (updates: {
    title?: string;
    font?: string;
    color?: string;
  }) => void;
  label?: string;
}

export function SectionTitleEditor({
  title,
  font,
  color,
  onUpdate,
  label = "Texto do Título",
}: SectionTitleEditorProps) {
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
        <Input
          value={title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="h-8 text-xs"
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
            value={font || "default"}
            onValueChange={(v) => onUpdate({ font: v === "default" ? "" : v })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Padrão do Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default" className="text-xs font-medium">
                Padrão do Site
              </SelectItem>
              {EDITOR_FONTS.map((f) => (
                <SelectItem key={f.name} value={f.name} className="text-xs">
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
          <legend className="text-[10px] uppercase text-muted-foreground font-medium mb-1.5 flex justify-between items-center">
            Cor
            {color && (
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:text-primary"
                onClick={() => onUpdate({ color: "" })}
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            )}
          </legend>
          <div className="flex gap-2">
            <Input
              type="color"
              value={color || "#000000"}
              className="w-8 h-8 p-1 rounded-md bg-transparent border-border/50 cursor-pointer"
              onChange={(e) => onUpdate({ color: e.target.value })}
            />
            <Input
              value={color || ""}
              placeholder="Padrão"
              className="h-8 text-[10px] flex-1 uppercase"
              onChange={(e) => onUpdate({ color: e.target.value })}
            />
          </div>
        </fieldset>
      </div>
    </div>
  );
}
