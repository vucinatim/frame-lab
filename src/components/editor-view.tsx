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
  const generationState = useStore((state) => state.generationState);
  const selectedFrame = useStore((state) => state.selectedFrame);
  const frameImages = useStore((state) => state.frameImages);
  const viewMode = useStore((state) => state.viewMode);

  return (
    <div className="relative flex flex-col w-full h-full gap-4">
      <FrameView />
      <Toolbar />
      <div className="flex-1 relative">
        <Card className="absolute inset-0 flex flex-col p-0 overflow-hidden">
          <CardContent className="absolute inset-0">
            {generationState.status === "loading" && <Spinner size="large" />}

            {/* View Mode: Pose Only */}
            {viewMode === "pose-only" && <PoseEditor />}

            {/* View Mode: Image Only */}
            {viewMode === "image-only" && frameImages[selectedFrame] && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={frameImages[selectedFrame]!}
                  alt={`Frame ${selectedFrame + 1}`}
                  width={512}
                  height={512}
                  className="object-contain"
                />
              </div>
            )}

            {/* View Mode: Stack (Image + Pose Editor) */}
            {viewMode === "stack" && (
              <>
                {/* Background: Show selected frame image if it exists */}
                {frameImages[selectedFrame] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src={frameImages[selectedFrame]!}
                      alt={`Frame ${selectedFrame + 1}`}
                      width={512}
                      height={512}
                      className="object-contain"
                    />
                  </div>
                )}

                {/* Foreground: Always show pose editor */}
                <PoseEditor />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
