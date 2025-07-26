/* eslint-disable @next/next/no-img-element */
"use client";

import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

export function CharacterImageSection() {
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
    const characterType =
      (formData.get("characterType") as string) || "fantasy hero";

    try {
      const response = await fetch("/api/generate-character", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          characterType,
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

      if (prediction.status === "succeeded") {
        setCharacterGenState({ status: "success", prediction, error: null });
        // Save the character prompt for use in animation generation
        const fullCharacterPrompt = prompt
          ? `${prompt}, ${characterType}`
          : characterType;
        setCharacterPrompt(fullCharacterPrompt);
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

  const handleUseGeneratedCharacter = async (imageUrl: string) => {
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
    } catch (error) {
      console.error("Error setting generated character:", error);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="character-image">Character Image</Label>

      {/* File Upload */}
      <div className="space-y-2">
        <Input
          id="character-image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          placeholder="Choose file or generate character below"
        />
      </div>

      {/* Character Generation */}
      <div className="space-y-3 p-3 rounded-lg border border-sky-500">
        <Label className="text-sm font-medium text-sky-500">
          Or Generate Character
        </Label>
        <form onSubmit={handleCharacterGeneration} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="characterType" className="text-xs">
              Character Type
            </Label>
            <Input
              id="characterType"
              name="characterType"
              placeholder="e.g., warrior, mage, archer"
              defaultValue="fantasy hero"
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-xs">
              Additional Details
            </Label>
            <Input
              id="prompt"
              name="prompt"
              placeholder="e.g., with golden armor, wielding a sword"
              className="text-sm"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="w-full"
            disabled={characterGenState.status === "loading"}
          >
            {characterGenState.status === "loading" ? (
              <>
                <Spinner className="mr-2 h-3 w-3" />
                Generating...
              </>
            ) : (
              "Generate Character"
            )}
          </Button>
        </form>

        {characterGenState.error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {characterGenState.error}
          </div>
        )}

        {characterGenState.prediction?.output &&
          characterGenState.prediction.output.length > 0 && (
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() =>
                  handleUseGeneratedCharacter(
                    characterGenState.prediction!.output![0]
                  )
                }
              >
                Use Generated Character
              </Button>
            </div>
          )}
      </div>

      {/* Unified Image Preview */}
      {(characterImage || characterImageDataUrl) && (
        <div className="space-y-2 z-0">
          <Label className="text-xs">Current Character</Label>
          <div className="relative aspect-square w-full max-w-[200px] mx-auto cursor-pointer group">
            <Image
              src={
                characterImage
                  ? URL.createObjectURL(characterImage)
                  : characterImageDataUrl!
              }
              alt="Character preview"
              fill
              className="object-contain rounded border group-hover:opacity-90 transition-opacity"
              sizes="200px"
              onClick={() => setLightboxOpen(true)}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
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
              <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
                Click to preview
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Dialog */}
      {(characterImage || characterImageDataUrl) && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogTitle className="sr-only">
              Character Image Fullscreen Preview
            </DialogTitle>
            <div className="relative w-full h-full p-4">
              <img
                src={
                  characterImage
                    ? URL.createObjectURL(characterImage)
                    : characterImageDataUrl!
                }
                alt="Character preview"
                className="w-full h-auto object-contain max-h-[80vh]"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
