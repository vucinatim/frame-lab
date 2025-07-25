"use client";

import { useStore } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import dynamic from "next/dynamic";
import { FrameView } from "./frame-view";
import { Toolbar } from "./toolbar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const PoseEditor = dynamic(() => import("@/components/pose-editor"), {
  ssr: false,
});

export function EditorView() {
  const generationState = useStore((state) => state.generationState);
  const selectedFrame = useStore((state) => state.selectedFrame);
  const frameImages = useStore((state) => state.frameImages);
  const poseImages = useStore((state) => state.poseImages);
  const viewMode = useStore((state) => state.viewMode);

  return (
    <div className="relative flex flex-col w-full h-full gap-4">
      <FrameView />
      <Toolbar />
      <div className="flex-1 relative">
        <Card className="absolute inset-0 flex flex-col p-0 overflow-hidden">
          <CardContent className="absolute inset-0">
            {generationState.status === "loading" && (
              <div className="absolute z-10 inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                <Spinner size="medium" />
                <p className="text-white text-2xl font-bold">Generating...</p>
              </div>
            )}

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

            {/* Pose Image Display - Top Right Corner */}
            {poseImages[selectedFrame] && (
              <div className="absolute top-4 right-4 z-20">
                <div className="relative rounded-lg border border-white/20 bg-black/80 p-2 backdrop-blur-sm">
                  <Image
                    src={poseImages[selectedFrame]!}
                    alt={`Pose ${selectedFrame + 1}`}
                    width={128}
                    height={128}
                    className="object-contain"
                  />
                  <a
                    href={poseImages[selectedFrame]!}
                    download={`pose-frame-${selectedFrame + 1}.png`}
                    className="absolute right-1 top-1"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white hover:bg-white/20 hover:text-white"
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download Pose</span>
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
