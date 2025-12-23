"use client";

import { Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SiteCustomizer() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <CardTitle>Personalização do Site</CardTitle>
          </div>
          <CardDescription>
            Configure as cores, fontes e elementos visuais do seu site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 border-2 border-dashed rounded-lg text-center">
            <p className="text-muted-foreground">
              Em breve: Opções para personalizar cores, fontes e estilo visual.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
