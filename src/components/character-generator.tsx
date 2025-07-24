"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import { toast } from "sonner";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Prediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string[];
  error?: string;
}

export function CharacterGenerator() {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

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
        setError(prediction.detail || "Failed to start generation");
        toast.error("Failed to start generation");
        return;
      }

      setPrediction(prediction);
      toast.info("Generation started...");

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
          setError(prediction.detail || "Failed to check status");
          toast.error("Failed to check generation status");
          return;
        }

        setPrediction(prediction);
      }

      if (prediction.status === "succeeded") {
        toast.success("Character generated successfully!");
      } else {
        setError("Generation failed");
        toast.error("Generation failed");
      }
    } catch (error) {
      console.error("Generation error:", error);
      setError("An error occurred during generation");
      toast.error("An error occurred during generation");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fantasy Hero Generator</CardTitle>
          <CardDescription>
            Generate a fantasy hero character in T-pose using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="characterType">Character Type</Label>
              <Input
                id="characterType"
                name="characterType"
                placeholder="e.g., warrior, mage, archer, paladin"
                defaultValue="fantasy hero"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Additional Details (Optional)</Label>
              <Input
                id="prompt"
                name="prompt"
                placeholder="e.g., with golden armor, wielding a sword, red hair"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Spinner className="mr-2" />
                  Generating...
                </>
              ) : (
                "Generate Character"
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {prediction && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Status:</span>
                <span
                  className={`text-sm ${
                    prediction.status === "succeeded"
                      ? "text-green-600"
                      : prediction.status === "failed"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {prediction.status}
                </span>
              </div>

              {prediction.output && prediction.output.length > 0 && (
                <div className="space-y-2">
                  <Label>Generated Character</Label>
                  <div className="relative aspect-square w-full max-w-md mx-auto">
                    <Image
                      src={prediction.output[prediction.output.length - 1]}
                      alt="Generated fantasy hero character"
                      fill
                      className="object-contain rounded-lg border"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
