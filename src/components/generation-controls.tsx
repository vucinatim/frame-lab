"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function GenerationControls() {
  const generationState = useStore((state) => state.generationState);
  const skeletons = useStore((state) => state.skeletons);
  const selectedFrame = useStore((state) => state.selectedFrame);
  const outputSize = useStore((state) => state.outputSize);
  const currentFrameGenerationId = useStore(
    (state) => state.currentFrameGenerationId
  );
  const sequenceGenerationId = useStore((state) => state.sequenceGenerationId);

  const setGenerationState = useStore((state) => state.setGenerationState);
  const setFinalSpriteSheet = useStore((state) => state.setFinalSpriteSheet);
  const setCurrentFrameGenerationId = useStore(
    (state) => state.setCurrentFrameGenerationId
  );
  const setSequenceGenerationId = useStore(
    (state) => state.setSequenceGenerationId
  );
  const setFrameImage = useStore((state) => state.setFrameImage);

  const [sequenceProgress, setSequenceProgress] = useState(0);

  const handleGenerateCurrentFrame = async () => {
    if (skeletons.length === 0 || selectedFrame >= skeletons.length) {
      setGenerationState({
        status: "error",
        message: "No frames available to generate",
      });
      return;
    }

    setGenerationState({ status: "loading" });
    setCurrentFrameGenerationId("current-frame-" + Date.now());

    try {
      const currentFrameSkeleton = skeletons[selectedFrame];

      const response = await fetch("/api/generate-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          poseData: currentFrameSkeleton,
          outputSize,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate current frame");
      }

      const result = await response.json();
      const generatedImageUrl = result[0];
      setFinalSpriteSheet(generatedImageUrl);
      setFrameImage(selectedFrame, generatedImageUrl);
      setGenerationState({ status: "success" });
      setCurrentFrameGenerationId(null);
    } catch (error) {
      console.error(error);
      setGenerationState({
        status: "error",
        message: (error as Error).message,
      });
      setCurrentFrameGenerationId(null);
    }
  };

  const handleGenerateSequence = async () => {
    if (skeletons.length === 0) {
      setGenerationState({
        status: "error",
        message: "No frames available to generate",
      });
      return;
    }

    setGenerationState({ status: "loading" });
    setSequenceGenerationId("sequence-" + Date.now());
    setSequenceProgress(0);

    try {
      const response = await fetch("/api/generate-test-sequence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skeletons,
          outputSize,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate sequence");
      }

      const result = await response.json();

      // Set all generated images to their respective frames
      result.images.forEach((imageUrl: string, index: number) => {
        setFrameImage(index, imageUrl);
        setSequenceProgress(((index + 1) / skeletons.length) * 100);
      });

      // Set the final sprite sheet to the first image for preview
      setFinalSpriteSheet(result.images[0]);
      setGenerationState({ status: "success" });
      setSequenceGenerationId(null);
      setSequenceProgress(0);
    } catch (error) {
      console.error(error);
      setGenerationState({
        status: "error",
        message: (error as Error).message,
      });
      setSequenceGenerationId(null);
      setSequenceProgress(0);
    }
  };

  const handleCancelGeneration = async (type: "current-frame" | "sequence") => {
    const generationId =
      type === "current-frame"
        ? currentFrameGenerationId
        : sequenceGenerationId;

    if (generationId) {
      try {
        // Cancel the generation (you might need to implement this endpoint)
        await fetch(`/api/predictions/${generationId}/cancel`, {
          method: "POST",
        });

        setGenerationState({ status: "idle" });
        if (type === "current-frame") {
          setCurrentFrameGenerationId(null);
        } else {
          setSequenceGenerationId(null);
        }
      } catch (error) {
        console.error("Failed to cancel generation:", error);
      }
    }
  };

  return (
    <div className="p-4 border-t sticky bottom-0 space-y-2">
      {generationState.status === "loading" && currentFrameGenerationId ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 p-4 border rounded-md bg-muted">
            <Spinner />
            <span>Generating Frame {selectedFrame + 1}...</span>
          </div>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => handleCancelGeneration("current-frame")}
          >
            Cancel Generation
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGenerateCurrentFrame}
          disabled={generationState.status === "loading"}
        >
          Generate Frame {selectedFrame + 1}
        </Button>
      )}

      {generationState.status === "loading" && sequenceGenerationId ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 p-4 border rounded-md bg-muted">
            <Spinner />
            <span>
              Generating Sequence ({skeletons.length} frames)...{" "}
              {Math.round(sequenceProgress)}%
            </span>
          </div>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => handleCancelGeneration("sequence")}
          >
            Cancel Generation
          </Button>
        </div>
      ) : (
        <Button
          className="w-full"
          onClick={handleGenerateSequence}
          disabled={generationState.status === "loading"}
        >
          Generate Sequence ({skeletons.length} frames)
        </Button>
      )}
    </div>
  );
}
