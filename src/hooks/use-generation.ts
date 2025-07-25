import { useState, useRef } from "react";
import { useStore } from "@/store";

export type GenerationType = "test" | "real";

interface GenerationOptions {
  type: GenerationType;
  prompt?: string;
}

export function useGeneration() {
  const skeletons = useStore((state) => state.skeletons);
  const selectedFrame = useStore((state) => state.selectedFrame);
  const outputSize = useStore((state) => state.outputSize);
  const characterImage = useStore((state) => state.characterImageDataUrl);
  const setGenerationState = useStore((state) => state.setGenerationState);
  const setFrameImage = useStore((state) => state.setFrameImage);
  const setPoseImage = useStore((state) => state.setPoseImage);
  const setFinalSpriteSheet = useStore((state) => state.setFinalSpriteSheet);
  const setCurrentFrameGenerationId = useStore(
    (state) => state.setCurrentFrameGenerationId
  );
  const setSequenceGenerationId = useStore(
    (state) => state.setSequenceGenerationId
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState<GenerationType>("test");
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateCurrentFrame = async (options: GenerationOptions) => {
    if (skeletons.length === 0 || selectedFrame >= skeletons.length) {
      setGenerationState({
        status: "error",
        message: "No frames available to generate",
      });
      return;
    }

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsGenerating(true);
    setGenerationState({ status: "loading" });
    setCurrentFrameGenerationId("current-frame-" + Date.now());

    try {
      const currentFrameSkeleton = skeletons[selectedFrame];

      const requestBody = {
        poseData: currentFrameSkeleton,
        outputSize,
        characterPrompt: options.prompt,
        characterImage,
      };

      const response = await fetch("/api/generate-character-frame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal,
      });

      if (!response.ok) {
        throw new Error("Failed to generate current frame");
      }

      let prediction = await response.json();

      if (response.status !== 201 && response.status !== 200) {
        setGenerationState({
          status: "error",
          message: prediction.detail || "Failed to start generation",
        });
        return;
      }

      // For test generation, the response is immediate (200 status)
      if (options.type === "test") {
        const generatedImageUrl = prediction.generatedImage;
        const poseImageUrl = prediction.poseImage;

        setFinalSpriteSheet(generatedImageUrl);
        setFrameImage(selectedFrame, generatedImageUrl);
        if (poseImageUrl) {
          setPoseImage(selectedFrame, poseImageUrl);
        }
        setGenerationState({ status: "success" });
        setCurrentFrameGenerationId(null);
        return;
      }

      // For real generation, we need to poll for completion
      setGenerationState({ status: "loading", prediction });
      setCurrentFrameGenerationId(prediction.id);

      // Poll for completion
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

      while (
        prediction.status !== "succeeded" &&
        prediction.status !== "failed" &&
        prediction.status !== "canceled"
      ) {
        await sleep(1000);
        const pollResponse = await fetch(`/api/predictions/${prediction.id}`);
        prediction = await pollResponse.json();

        if (pollResponse.status !== 200) {
          setGenerationState({
            status: "error",
            message: prediction.detail || "Failed to check status",
          });
          return;
        }

        setGenerationState({ status: "loading", prediction });
      }

      if (
        prediction.status === "succeeded" &&
        prediction.output &&
        prediction.output.length > 0
      ) {
        const generatedImageUrl = prediction.output[0];
        const poseImageUrl = prediction.poseImage; // Get pose image from response

        setFinalSpriteSheet(generatedImageUrl);
        setFrameImage(selectedFrame, generatedImageUrl);
        if (poseImageUrl) {
          setPoseImage(selectedFrame, poseImageUrl);
        }
        setGenerationState({ status: "success" });
      } else {
        setGenerationState({
          status: "error",
          message: "Generation failed",
        });
      }
      setCurrentFrameGenerationId(null);
    } catch (error) {
      // Check if it's an abort error
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request was aborted");
        setGenerationState({ status: "idle" });
      } else {
        console.error(error);
        setGenerationState({
          status: "error",
          message: (error as Error).message,
        });
      }
      setCurrentFrameGenerationId(null);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const generateSequence = async (options: GenerationOptions) => {
    if (skeletons.length === 0) {
      setGenerationState({
        status: "error",
        message: "No frames available to generate",
      });
      return;
    }

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsGenerating(true);
    setGenerationState({ status: "loading" });
    setSequenceGenerationId("sequence-" + Date.now());

    try {
      const requestBody = {
        skeletons,
        outputSize,
        characterPrompt: options.prompt,
        characterImage,
      };

      const response = await fetch("/api/generate-character-sequence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal,
      });

      if (!response.ok) {
        throw new Error("Failed to generate sequence");
      }

      const result = await response.json();

      if (result.success) {
        // Update all frame images and pose images
        result.images.forEach((imageUrl: string, index: number) => {
          setFrameImage(index, imageUrl);
        });

        if (result.poseImages) {
          result.poseImages.forEach((poseImageUrl: string, index: number) => {
            setPoseImage(index, poseImageUrl);
          });
        }

        setGenerationState({ status: "success" });
      } else {
        setGenerationState({
          status: "error",
          message: result.error || "Generation failed",
        });
      }
      setSequenceGenerationId(null);
    } catch (error) {
      // Check if it's an abort error
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request was aborted");
        setGenerationState({ status: "idle" });
      } else {
        console.error(error);
        setGenerationState({
          status: "error",
          message: (error as Error).message,
        });
      }
      setSequenceGenerationId(null);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const cancelGeneration = async (type: "current-frame" | "sequence") => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (type === "current-frame") {
      setCurrentFrameGenerationId(null);
    } else {
      setSequenceGenerationId(null);
    }

    setGenerationState({ status: "idle" });
    setIsGenerating(false);
  };

  return {
    isGenerating,
    generationType,
    setGenerationType,
    generateCurrentFrame,
    generateSequence,
    cancelGeneration,
  };
}
