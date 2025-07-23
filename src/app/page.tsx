"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store";
import dynamic from "next/dynamic";
import { Toaster, toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

const PoseEditor = dynamic(() => import("@/components/pose-editor"), {
  ssr: false,
});

export default function Home() {
  const {
    characterImage,
    setCharacterImage,
    generationState,
    setGenerationState,
    finalSpriteSheet,
    setFinalSpriteSheet,
  } = useStore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCharacterImage(event.target.files[0]);
    }
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleGenerate = async () => {
    if (!characterImage) {
      toast.error("Please upload a character image first.");
      return;
    }

    setGenerationState({ status: "loading" });
    toast.info("Starting generation...");

    try {
      const imageBase64 = await toBase64(characterImage);
      const mockPoseData = [{ image: "pose1.png" }]; // Replace with real data

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          characterImage: imageBase64,
          poseData: mockPoseData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate sprite sheet");
      }

      const result = await response.json();
      setFinalSpriteSheet(result[0]); // Assuming result is an array of URLs
      setGenerationState({ status: "success" });
      toast.success("Sprite sheet generated successfully!");
    } catch (error) {
      console.error(error);
      setGenerationState({
        status: "error",
        message: (error as Error).message,
      });
      toast.error("An error occurred during generation.");
    }
  };

  return (
    <div className="flex h-full">
      <Toaster />
      <aside className="w-1/4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>
              Adjust your animation settings here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="character-image">Character Image</Label>
              <Input
                id="character-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="animation-preset">Animation Preset</Label>
              <Select>
                <SelectTrigger id="animation-preset">
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk">Walk</SelectItem>
                  <SelectItem value="run">Run</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={generationState.status === "loading"}
            >
              {generationState.status === "loading" ? <Spinner /> : "Generate"}
            </Button>
          </CardContent>
        </Card>
      </aside>
      <main className="flex-1 p-4">
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
      </main>
    </div>
  );
}
