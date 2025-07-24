"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CharacterImageSection } from "./character-image-section";
import { AnimationSettings } from "./animation-settings";
import { GenerationControls } from "./generation-controls";

export function ControlPanel() {
  return (
    <Card className="h-full p-0 overflow-hidden">
      <ScrollArea className="h-full pb-24">
        <div className="sticky min-h-0 top-0 p-4 bg-white border-b">
          <CardTitle>Control Panel</CardTitle>
        </div>
        <CardContent className="space-y-4 p-4 pb-16 bg-zinc-50">
          <CharacterImageSection />
          <AnimationSettings />
        </CardContent>
      </ScrollArea>
      <GenerationControls />
    </Card>
  );
}
