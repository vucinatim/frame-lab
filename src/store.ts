import { create } from "zustand";

interface GenerationState {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
}

interface AppState {
  characterImage: File | null;
  poseData: unknown | null; // This will be defined more specifically later
  generationState: GenerationState;
  finalSpriteSheet: string | null;
  setCharacterImage: (image: File | null) => void;
  setPoseData: (data: unknown | null) => void;
  setGenerationState: (state: GenerationState) => void;
  setFinalSpriteSheet: (url: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  characterImage: null,
  poseData: null,
  generationState: { status: "idle" },
  finalSpriteSheet: null,
  setCharacterImage: (image) => set({ characterImage: image }),
  setPoseData: (data) => set({ poseData: data }),
  setGenerationState: (state) => set({ generationState: state }),
  setFinalSpriteSheet: (url) => set({ finalSpriteSheet: url }),
}));
