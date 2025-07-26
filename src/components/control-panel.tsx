"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CharacterImageSection } from "./character-image-section";
import { GenerationSettings } from "./generation-settings";
import { GenerationControls } from "./generation-controls";
import { PromptSettings } from "./prompt-settings";

export function ControlPanel() {
  return (
    <Card className="h-full p-0 overflow-hidden">
      <ScrollArea className="h-full" hideScrollbar>
        <div className="sticky min-h-0 top-0 p-4 z-20 border-b bg-zinc-900">
          <CardTitle>Control Panel</CardTitle>
        </div>
        <CardContent className="space-y-4 p-4 pb-[200px]">
          <CharacterImageSection />
          <PromptSettings />
          <GenerationSettings />
        </CardContent>
        <div className="sticky bottom-0 p-4 border-t bg-zinc-900">
          <GenerationControls />
        </div>
      </ScrollArea>
    </Card>
  );
}
