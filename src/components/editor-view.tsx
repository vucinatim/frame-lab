"use client";

import { useStore } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import dynamic from "next/dynamic";
import { FrameView } from "./frame-view";
import { Toolbar } from "./toolbar";

const PoseEditor = dynamic(() => import("@/components/pose-editor"), {
  ssr: false,
});

export function EditorView() {
  const { generationState, finalSpriteSheet } = useStore();

  return (
    <div className="relative flex flex-col w-full h-full gap-4">
      <FrameView />
      <Toolbar />
      <div className="flex-1 relative">
        <Card className="absolute inset-0 flex flex-col p-0 overflow-hidden">
          <CardContent className="absolute inset-0">
            {generationState.status === "loading" && <Spinner size="large" />}
            {generationState.status !== "loading" && !finalSpriteSheet && (
              <PoseEditor />
            )}
            {finalSpriteSheet && (
              <Image
                src={finalSpriteSheet}
                alt="Generated Sprite Sheet"
                width={512}
                height={512}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
