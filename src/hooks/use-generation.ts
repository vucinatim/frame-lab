import { useState, useRef } from "react";
import { useStore } from "@/store";

export type GenerationType = "test" | "real";

interface GenerationOptions {
  type: GenerationType;
  prompt?: string; // Optional for backwards compatibility
}

export function useGeneration() {
  const skeletons = useStore((state) => state.skeletons);
  const selectedFrame = useStore((state) => state.selectedFrame);
  const outputSize = useStore((state) => state.outputSize);
  const characterImage = useStore((state) => state.characterImageDataUrl);
  const characterPrompt = useStore((state) => state.characterPrompt);
  const motionPrompt = useStore((state) => state.motionPrompt);
  const framePrompts = useStore((state) => state.framePrompts);
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

  const constructPrompt = (frameIndex: number, options: GenerationOptions) => {
    const parts: string[] = [];

    // Add character description if available
    if (characterPrompt.trim()) {
      parts.push(characterPrompt.trim());
    }

    // Add motion description if available
    if (motionPrompt.trim()) {
      parts.push(motionPrompt.trim());
    }

    // Add frame-specific prompt if available
    const frameSpecificPrompt = framePrompts[frameIndex];
    if (frameSpecificPrompt?.trim()) {
      parts.push(frameSpecificPrompt.trim());
    }

    // Add any additional prompt from options (for backwards compatibility)
    if (options.prompt?.trim()) {
      parts.push(options.prompt.trim());
    }

    return parts.join(", ");
  };

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
      const fullPrompt = constructPrompt(selectedFrame, options);

      const requestBody = {
        poseData: currentFrameSkeleton,
        outputSize,
        characterPrompt: fullPrompt,
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

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsGenerating(true);
    setGenerationState({
      status: "loading",
      message: "Starting sequence generation...",
    });
    setSequenceGenerationId("sequence-" + Date.now());

    try {
      for (let i = 0; i < skeletons.length; i++) {
        if (signal.aborted) {
          // This error is caught and handled as an abort.
          throw new Error("AbortError");
        }

        setGenerationState({
          status: "loading",
          message: `Generating frame ${i + 1} of ${skeletons.length}...`,
        });

        const currentFrameSkeleton = skeletons[i];
        const fullPrompt = constructPrompt(i, options);
        const requestBody = {
          poseData: currentFrameSkeleton,
          outputSize,
          characterPrompt: fullPrompt,
          characterImage,
        };

        const response = await fetch("/api/generate-character-frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal,
        });

        if (!response.ok) {
          let errorDetail = `Request failed with status ${response.status}`;
          try {
            const errorJson = await response.json();
            errorDetail = errorJson.detail || errorJson.error || errorDetail;
          } catch (e) {
            console.error("Error parsing response:", e);
            // Ignore if response is not json or empty
          }
          throw new Error(
            `Failed to start generation for frame ${i + 1}: ${errorDetail}`
          );
        }

        let prediction = await response.json();

        if (response.status !== 201) {
          setGenerationState({
            status: "error",
            message:
              prediction.detail ||
              `Failed to start generation for frame ${i + 1}`,
          });
          return; // Stop the sequence
        }

        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

        while (
          prediction.status !== "succeeded" &&
          prediction.status !== "failed" &&
          prediction.status !== "canceled"
        ) {
          if (signal.aborted) {
            // Attempt to cancel the running prediction on Replicate
            if (prediction.urls?.cancel) {
              await fetch(prediction.urls.cancel, { method: "POST" });
            }
            throw new Error("AbortError");
          }
          await sleep(1000);
          const pollResponse = await fetch(
            `/api/predictions/${prediction.id}`,
            {
              signal,
            }
          );

          if (!pollResponse.ok) {
            console.error(
              `Polling failed for prediction ${prediction.id}, status: ${pollResponse.status}`
            );
            // Decide if we should continue polling or fail the frame
            continue; // Continue polling for now
          }
          prediction = await pollResponse.json();
        }

        if (
          prediction.status === "succeeded" &&
          prediction.output &&
          prediction.output.length > 0
        ) {
          const generatedImageUrl = prediction.output[0];
          const poseImageUrl = prediction.poseImage;

          setFrameImage(i, generatedImageUrl);
          if (poseImageUrl) {
            setPoseImage(i, poseImageUrl);
          }
        } else {
          console.error(
            `Frame ${i + 1} generation failed or was canceled.`,
            prediction
          );
          // Continue to the next frame. The UI will show the frame as not generated.
        }
      }

      setGenerationState({
        status: "success",
        message: "Sequence generated successfully!",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Sequence generation was aborted by the user.");
        setGenerationState({ status: "idle" });
      } else {
        console.error("An error occurred during sequence generation:", error);
        setGenerationState({
          status: "error",
          message: (error as Error).message,
        });
      }
    } finally {
      setIsGenerating(false);
      setSequenceGenerationId(null);
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
