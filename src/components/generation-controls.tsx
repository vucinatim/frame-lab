"use client";

import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function GenerationControls() {
  const {
    generationState,
    setGenerationState,
    poseData,
    outputSize,
    setFinalSpriteSheet,
    currentFrameGenerationId,
    setCurrentFrameGenerationId,
    sequenceGenerationId,
    setSequenceGenerationId,
  } = useStore();

  const handleGenerateCurrentFrame = async () => {
    setGenerationState({ status: "loading" });
    setCurrentFrameGenerationId("current-frame-" + Date.now());

    try {
      const response = await fetch("/api/generate-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          poseData,
          outputSize,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate current frame");
      }

      const result = await response.json();
      setFinalSpriteSheet(result[0]);
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
    setGenerationState({ status: "loading" });
    setSequenceGenerationId("sequence-" + Date.now());

    try {
      const response = await fetch("/api/generate-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          poseData,
          outputSize,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate sequence");
      }

      const result = await response.json();
      setFinalSpriteSheet(result[0]);
      setGenerationState({ status: "success" });
      setSequenceGenerationId(null);
    } catch (error) {
      console.error(error);
      setGenerationState({
        status: "error",
        message: (error as Error).message,
      });
      setSequenceGenerationId(null);
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
    <div className="p-4 border-t sticky bottom-0 bg-white space-y-2">
      <Button
        variant="outline"
        className="w-full"
        onClick={handleGenerateCurrentFrame}
        disabled={generationState.status === "loading"}
      >
        {generationState.status === "loading" && currentFrameGenerationId ? (
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Generating...</span>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelGeneration("current-frame");
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          "Generate Current Frame"
        )}
      </Button>

      <Button
        className="w-full"
        onClick={handleGenerateSequence}
        disabled={generationState.status === "loading"}
      >
        {generationState.status === "loading" && sequenceGenerationId ? (
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Generating...</span>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelGeneration("sequence");
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          "Generate Entire Sequence"
        )}
      </Button>
    </div>
  );
}
