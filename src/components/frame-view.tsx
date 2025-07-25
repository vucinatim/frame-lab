"use client";

import { useStore } from "@/store";
import { AnimationFrame } from "./animation-frame";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

export function FrameView() {
  const { skeletons, frameImages } = useStore();
  const frames = skeletons.map((skeleton, index) => ({
    image: frameImages[index] || undefined,
    skeleton,
  }));

  return (
    <Card className="p-0">
      <CardContent className="p-0">
        <ScrollArea className="whitespace-nowrap">
          <div className="flex">
            {frames.map((frame, index) => (
              <div key={index} className="p-2 border-r">
                <AnimationFrame frame={frame} index={index} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
