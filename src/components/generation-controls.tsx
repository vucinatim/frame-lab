"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGeneration, GenerationType } from "@/hooks/use-generation";

export function GenerationControls() {
  const generationState = useStore((state) => state.generationState);
  const skeletons = useStore((state) => state.skeletons);
  const characterImageDataUrl = useStore(
    (state) => state.characterImageDataUrl
  );
  const currentFrameGenerationId = useStore(
    (state) => state.currentFrameGenerationId
  );
  const sequenceGenerationId = useStore((state) => state.sequenceGenerationId);

  const {
    isGenerating,
    generationType,
    setGenerationType,
    generateCurrentFrame,
    generateSequence,
    cancelGeneration,
  } = useGeneration();

  const [prompt, setPrompt] = useState("");

  const handleGenerateCurrentFrame = async () => {
    await generateCurrentFrame({
      type: generationType,
      prompt,
    });
  };

  const handleGenerateSequence = async () => {
    await generateSequence({
      type: generationType,
      prompt,
    });
  };

  const handleCancelGeneration = async (type: "current-frame" | "sequence") => {
    await cancelGeneration(type);
  };

  const isGeneratingCurrentFrame = currentFrameGenerationId !== null;
  const isGeneratingSequence = sequenceGenerationId !== null;
  const isRealGenerationDisabled =
    generationType === "real" && !characterImageDataUrl;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-2 w-full">
          <Label htmlFor="generation-type">Generation Type</Label>
          <Select
            value={generationType}
            onValueChange={(value: GenerationType) => setGenerationType(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select generation type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="test">Test Generation</SelectItem>
              <SelectItem value="real">Real Generation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {generationType === "real" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Input
              id="prompt"
              placeholder="e.g., dynamic action pose, cinematic lighting"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            {isRealGenerationDisabled && (
              <p className="text-xs text-yellow-500">
                Please upload or generate a character image first.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleGenerateCurrentFrame}
          disabled={
            isGenerating || skeletons.length === 0 || isRealGenerationDisabled
          }
          className="flex-1"
        >
          {isGeneratingCurrentFrame ? (
            <>
              <Spinner size="small" className="mr-2" />
              Generating...
            </>
          ) : (
            "Gen Frame"
          )}
        </Button>

        <Button
          onClick={handleGenerateSequence}
          variant="outline"
          disabled={
            isGenerating || skeletons.length === 0 || isRealGenerationDisabled
          }
          className="flex-1"
        >
          {isGeneratingSequence ? (
            <>
              <Spinner size="small" className="mr-2" />
              Generating Sequence...
            </>
          ) : (
            "Gen Sequence"
          )}
        </Button>
      </div>

      {(isGeneratingCurrentFrame || isGeneratingSequence) && (
        <Button
          onClick={() =>
            handleCancelGeneration(
              isGeneratingCurrentFrame ? "current-frame" : "sequence"
            )
          }
          variant="destructive"
          className="w-full"
        >
          Cancel Generation
        </Button>
      )}

      {generationState.status === "error" && (
        <div className="text-red-500 text-sm">
          Error: {generationState.message}
        </div>
      )}

      {generationState.status === "success" && (
        <div className="text-green-500 text-sm">Generation completed!</div>
      )}
    </div>
  );
}
