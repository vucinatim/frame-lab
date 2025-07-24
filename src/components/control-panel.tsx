"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CharacterImageSection } from "./character-image-section";
import { GenerationSettings } from "./generation-settings";
import { GenerationControls } from "./generation-controls";

export function ControlPanel() {
  return (
    <Card className="h-full p-0 overflow-hidden">
      <ScrollArea className="h-full pb-24">
        <div className="sticky min-h-0 top-0 p-4 bg-white border-b">
          <CardTitle>Control Panel</CardTitle>
        </div>
        <CardContent
          style={{
            minHeight: "calc(100vh - 180px)",
          }}
          className="space-y-4 p-4 pb-16 bg-zinc-50"
        >
          <CharacterImageSection />
          <GenerationSettings />
        </CardContent>
      </ScrollArea>
      <GenerationControls />
    </Card>
  );
}
