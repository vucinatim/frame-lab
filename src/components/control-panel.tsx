"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Github } from "lucide-react";
import { CharacterImageSection } from "./character-image-section";
import { GenerationSettings } from "./generation-settings";
import { GenerationControls } from "./generation-controls";
import { PromptSettings } from "./prompt-settings";

export function ControlPanel() {
  return (
    <Card className="h-full p-0 overflow-hidden">
      <ScrollArea className="h-full" hideScrollbar>
        <div className="sticky min-h-0 top-0 p-4 z-20 border-b bg-zinc-900">
          <div className="flex items-center justify-between">
            <CardTitle>Control Panel</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-6 w-6 p-0"
                  >
                    <a
                      href="https://github.com/vucinatim/frame-lab"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View source on GitHub"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View source on GitHub</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <CardContent className="space-y-8 p-4 pb-[100px]">
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
