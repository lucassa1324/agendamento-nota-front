"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { BackgroundEditor } from "../site_editor/components/BackgroundEditor";
import { SectionSubtitleEditor } from "../site_editor/components/SectionSubtitleEditor";
import { SectionTitleEditor } from "../site_editor/components/SectionTitleEditor";

export interface HeroEditorProps {
  settings: {
    // Title Fields
    title: string;
    titleFont: string;
    titleColor: string;
    
    // Subtitle Fields
    subtitle: string;
    subtitleFont: string;
    subtitleColor: string;

    // Background Fields
    bgType: "color" | "image";
    bgColor: string;
    bgImage: string;
    imageOpacity: number;
    overlayOpacity: number;
    imageScale: number;
    imageX: number;
    imageY: number;
    
    // Legacy/Unused
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: unknown;
  };
  onUpdate: (updates: Partial<HeroEditorProps["settings"]>) => void;
  onHighlight?: (sectionId: string) => void;
  hasChanges?: boolean;
  onSave?: () => void;
}

export function HeroEditor({
  settings,
  onUpdate,
}: HeroEditorProps) {
  
  // Helper to ensure updates are propagated correctly
  const handleUpdate = (updates: Partial<HeroEditorProps["settings"]>) => {
    onUpdate(updates);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9 mb-4">
          <TabsTrigger value="content" className="text-xs">
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs">
            Aparência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 mt-0">
          <SectionTitleEditor
            title={settings.title}
            font={settings.titleFont}
            color={settings.titleColor}
            onUpdate={(updates) => handleUpdate({ ...updates })}
          />

          <SectionSubtitleEditor
            subtitle={settings.subtitle}
            font={settings.subtitleFont}
            color={settings.subtitleColor}
            onUpdate={(updates) => handleUpdate({ ...updates })}
          />
        </TabsContent>

        <TabsContent value="style" className="space-y-4 mt-0">
          <BackgroundEditor
            settings={{
              bgType: settings.bgType,
              bgColor: settings.bgColor,
              bgImage: settings.bgImage,
              imageOpacity: settings.imageOpacity,
              overlayOpacity: settings.overlayOpacity,
              imageScale: settings.imageScale,
              imageX: settings.imageX,
              imageY: settings.imageY,
            }}
            onUpdate={(updates) => handleUpdate({ ...updates })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
