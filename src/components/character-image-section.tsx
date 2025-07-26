/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useStore, type GeneratedImage } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { InfoTooltip, InfoTooltipProvider } from "@/components/ui/info-tooltip";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function CharacterImageSection() {
  const [activeTab, setActiveTab] = useState<"upload" | "generate">("generate");

  const characterImage = useStore((state) => state.characterImage);
  const characterImageDataUrl = useStore(
    (state) => state.characterImageDataUrl
  );
  const characterGenState = useStore((state) => state.characterGenState);
  const lightboxOpen = useStore((state) => state.lightboxOpen);

  const setCharacterImage = useStore((state) => state.setCharacterImage);
  const setCharacterImageDataUrl = useStore(
    (state) => state.setCharacterImageDataUrl
  );
  const setCharacterGenState = useStore((state) => state.setCharacterGenState);
  const setLightboxOpen = useStore((state) => state.setLightboxOpen);
  const setCharacterPrompt = useStore((state) => state.setCharacterPrompt);
  const generationHistory = useStore((state) => state.generationHistory);
  const addToGenerationHistory = useStore(
    (state) => state.addToGenerationHistory
  );

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setCharacterImage(file);

      // Convert to data URL for persistence
      const dataUrl = await toBase64(file);
      setCharacterImageDataUrl(dataUrl);
    }
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleCharacterGeneration = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setCharacterGenState({ status: "loading", prediction: null, error: null });

    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt") as string;

    if (!prompt.trim()) {
      setCharacterGenState({
        status: "error",
        prediction: null,
        error: "Please enter a character description",
      });
      return;
    }

    try {
      const response = await fetch("/api/generate-character", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          characterType: "", // Remove separate character type
        }),
      });

      let prediction = await response.json();

      if (response.status !== 201) {
        setCharacterGenState({
          status: "error",
          prediction: null,
          error: prediction.detail || "Failed to start generation",
        });
        return;
      }

      setCharacterGenState({ status: "loading", prediction, error: null });

      // Poll for completion
      while (
        prediction.status !== "succeeded" &&
        prediction.status !== "failed" &&
        prediction.status !== "canceled"
      ) {
        await sleep(1000);
        const response = await fetch("/api/predictions/" + prediction.id);
        prediction = await response.json();

        if (response.status !== 200) {
          setCharacterGenState({
            status: "error",
            prediction: null,
            error: prediction.detail || "Failed to check status",
          });
          return;
        }

        setCharacterGenState({ status: "loading", prediction, error: null });
      }

      if (prediction.status === "succeeded" && prediction.output?.[0]) {
        setCharacterGenState({ status: "success", prediction, error: null });

        // Add to history (keep only last 5)
        const newImage: GeneratedImage = {
          id: prediction.id,
          url: prediction.output[0],
          prompt: prompt,
          timestamp: Date.now(),
        };

        addToGenerationHistory(newImage);

        // Automatically use the generated image
        await handleUseGeneratedCharacter(prediction.output[0], prompt);
      } else {
        setCharacterGenState({
          status: "error",
          prediction: null,
          error: "Generation failed",
        });
      }
    } catch (error) {
      console.error("Generation error:", error);
      setCharacterGenState({
        status: "error",
        prediction: null,
        error: "An error occurred during generation",
      });
    }
  };

  const handleUseGeneratedCharacter = async (
    imageUrl: string,
    prompt?: string
  ) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "generated-character.png", {
        type: "image/png",
      });
      setCharacterImage(file);

      // Convert to data URL for persistence
      const dataUrl = await toBase64(file);
      setCharacterImageDataUrl(dataUrl);

      // Save the character prompt for use in animation generation
      if (prompt) {
        setCharacterPrompt(prompt);
      }
    } catch (error) {
      console.error("Error setting generated character:", error);
    }
  };

  return (
    <InfoTooltipProvider>
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-2">
          <InfoTooltip content="Upload an existing image or generate a new character using AI. This character will be used as the base for creating animations." />
          <Label>Character Image</Label>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-muted p-1 rounded-lg">
          <button
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === "generate"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab("generate")}
          >
            Generate
          </button>
          <button
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === "upload"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab("upload")}
          >
            Upload
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "upload" ? (
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                placeholder="Choose character image"
              />
              <p className="text-xs text-muted-foreground">
                Upload an image of your character for animation
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <form onSubmit={handleCharacterGeneration} className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <InfoTooltip content="Describe what you want your character to look like. Be specific about style, clothing, colors, and physical features for better results." />
                    <Label htmlFor="prompt" className="text-sm">
                      Character Description
                    </Label>
                  </div>
                  <Textarea
                    id="prompt"
                    name="prompt"
                    placeholder="e.g., fantasy warrior with golden armor and a red cape, holding a sword"
                    rows={3}
                    disabled={characterGenState.status === "loading"}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={characterGenState.status === "loading"}
                >
                  {characterGenState.status === "loading" ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Generating...
                    </>
                  ) : (
                    "Generate Character"
                  )}
                </Button>
              </form>

              {characterGenState.error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                  {characterGenState.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Character Image */}
        {(characterImage || characterImageDataUrl) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <InfoTooltip content="This is your currently selected character image that will be used for animation generation. Click to view fullscreen." />
              <Label className="text-sm">Current Character</Label>
            </div>
            <div className="relative aspect-square w-full max-w-[200px] mx-auto cursor-pointer group">
              <Image
                src={
                  characterImage
                    ? URL.createObjectURL(characterImage)
                    : characterImageDataUrl!
                }
                alt="Character preview"
                fill
                className="object-contain rounded-lg border group-hover:opacity-90 transition-opacity"
                sizes="200px"
                onClick={() => setLightboxOpen(true)}
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  const imageUrl = characterImage
                    ? URL.createObjectURL(characterImage)
                    : characterImageDataUrl!;
                  window.open(imageUrl, "_blank");
                }}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Button>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                  Click to enlarge
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generated Images History */}
        {generationHistory.length > 0 && (
          <div className="space-y-3 w-full">
            <div className="flex items-center gap-2">
              <InfoTooltip content="Previously generated characters from this session. Click any thumbnail to switch to that character for animation." />
              <Label className="text-sm">Recent Generations</Label>
            </div>
            <div className="relative w-full overflow-x-auto">
              <div className="grid grid-cols-5 gap-2 pb-2">
                {generationHistory.map((image: GeneratedImage) => (
                  <div
                    key={image.id}
                    className="flex-shrink-0 relative group cursor-pointer"
                    onClick={() =>
                      handleUseGeneratedCharacter(image.url, image.prompt)
                    }
                  >
                    <div className="w-16 h-16 relative rounded-md overflow-hidden border-2 border-muted hover:border-primary transition-colors">
                      <img
                        src={image.url}
                        alt={`Generated: ${image.prompt.slice(0, 50)}...`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/70 text-white px-1 py-0.5 rounded text-xs">
                          Use
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Click any thumbnail to use that character
            </p>
          </div>
        )}

        {/* Image Preview Dialog */}
        {(characterImage || characterImageDataUrl) && (
          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] p-0">
              <DialogTitle className="sr-only">
                Character Image Fullscreen Preview
              </DialogTitle>
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <img
                  src={
                    characterImage
                      ? URL.createObjectURL(characterImage)
                      : characterImageDataUrl!
                  }
                  alt="Character preview"
                  className="w-full h-auto object-contain max-h-[90vh]"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </InfoTooltipProvider>
  );
}
