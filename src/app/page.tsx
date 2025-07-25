"use client";

import { useStore } from "@/store";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { ControlPanel } from "@/components/control-panel";
import { EditorView } from "@/components/editor-view";

export default function Home() {
  const characterImage = useStore((state) => state.characterImage);
  const characterImageDataUrl = useStore(
    (state) => state.characterImageDataUrl
  );
  const setCharacterImage = useStore((state) => state.setCharacterImage);

  // Recover character image from data URL on page load
  useEffect(() => {
    if (characterImageDataUrl && !characterImage) {
      const dataUrlToFile = async (dataUrl: string): Promise<File> => {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        return new File([blob], "recovered-character.png", {
          type: "image/png",
        });
      };

      dataUrlToFile(characterImageDataUrl)
        .then((file) => {
          setCharacterImage(file);
        })
        .catch((error) => {
          console.error("Failed to recover character image:", error);
        });
    }
  }, [characterImageDataUrl, characterImage, setCharacterImage]);

  return (
    <div className="flex h-full">
      <Toaster />
      <aside className="w-1/4 p-4 pr-0 h-screen">
        <ControlPanel />
      </aside>
      <main className="relative flex-1">
        <div className="absolute inset-0 p-4">
          <EditorView />
        </div>
      </main>
    </div>
  );
}
