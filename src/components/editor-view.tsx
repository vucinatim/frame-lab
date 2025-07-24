"use client";

import { useStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import dynamic from "next/dynamic";

const PoseEditor = dynamic(() => import("@/components/pose-editor"), {
  ssr: false,
});

export function EditorView() {
  const { generationState, finalSpriteSheet } = useStore();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Editor</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-full">
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
  );
}
