/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Skeleton, DEFAULT_SKELETON, Joint, HIERARCHY } from "@/lib/pose-data";

export type OutputSize = "256x256" | "512x512" | "768x768" | "1024x1024";

interface GenerationState {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
}

interface Prediction {
  id: string;
  status: string;
  output?: string[];
}

interface CharacterGenerationState {
  status: "idle" | "loading" | "success" | "error";
  prediction: Prediction | null;
  error: string | null;
}

interface AppState {
  characterImage: File | null;
  characterImageDataUrl: string | null; // For persistence
  poseData: Skeleton;
  generationState: GenerationState;
  finalSpriteSheet: string | null;
  outputSize: OutputSize;
  characterGenState: CharacterGenerationState;
  currentFrameGenerationId: string | null;
  sequenceGenerationId: string | null;
  lightboxOpen: boolean;
  setCharacterImage: (image: File | null) => void;
  setCharacterImageDataUrl: (dataUrl: string | null) => void;
  setPoseData: (data: Skeleton) => void;
  setJointRotation: (jointId: string, rotation: number) => void;
  translateSkeleton: (dx: number, dy: number) => void;
  setGenerationState: (state: GenerationState) => void;
  setFinalSpriteSheet: (url: string | null) => void;
  setOutputSize: (size: OutputSize) => void;
  setCharacterGenState: (state: Partial<CharacterGenerationState>) => void;
  setCurrentFrameGenerationId: (id: string | null) => void;
  setSequenceGenerationId: (id: string | null) => void;
  setLightboxOpen: (isOpen: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      characterImage: null,
      characterImageDataUrl: null,
      poseData: DEFAULT_SKELETON,
      generationState: { status: "idle" },
      finalSpriteSheet: null,
      outputSize: "512x512",
      characterGenState: {
        status: "idle",
        prediction: null,
        error: null,
      },
      currentFrameGenerationId: null,
      sequenceGenerationId: null,
      lightboxOpen: false,

      setCharacterImage: (image) => set({ characterImage: image }),

      setCharacterImageDataUrl: (dataUrl) =>
        set({ characterImageDataUrl: dataUrl }),

      setPoseData: (data) => set({ poseData: data }),

      setJointRotation: (jointId, rotation) =>
        set((state) => {
          const newPoseData = [...state.poseData];
          const jointsById = Object.fromEntries(
            newPoseData.map((j) => [j.id, j])
          );

          // Update the target joint's rotation
          const targetJoint = jointsById[jointId];
          if (targetJoint) {
            targetJoint.rotation = rotation;
          }

          // Recursive function to update children
          const updateChildren = (
            parentId: string,
            parentAbsRotation: number
          ) => {
            const children = HIERARCHY[parentId];
            if (children) {
              children.forEach((childId) => {
                const child = jointsById[childId];
                const parent = jointsById[parentId];
                if (child && parent) {
                  const absRotation = parentAbsRotation + child.rotation;
                  child.x = parent.x + Math.cos(absRotation) * child.length;
                  child.y = parent.y + Math.sin(absRotation) * child.length;
                  updateChildren(childId, absRotation);
                }
              });
            }
          };

          // Find the absolute rotation of the parent to start the update
          const parent = targetJoint ? jointsById[targetJoint.parentId!] : null;
          if (parent) {
            let parentAbsRotation = 0;
            let current: Joint | null = parent;
            while (current) {
              parentAbsRotation += current.rotation;
              current = current.parentId ? jointsById[current.parentId] : null;
            }
            updateChildren(parent.id, parentAbsRotation);
          } else if (targetJoint) {
            // This is a root joint
            updateChildren(jointId, targetJoint.rotation);
          }

          return { poseData: newPoseData };
        }),

      translateSkeleton: (dx, dy) =>
        set((state) => ({
          poseData: state.poseData.map((joint) => ({
            ...joint,
            x: joint.x + dx,
            y: joint.y + dy,
          })),
        })),

      setGenerationState: (state) => set({ generationState: state }),
      setFinalSpriteSheet: (url) => set({ finalSpriteSheet: url }),
      setOutputSize: (size) => set({ outputSize: size }),
      setCharacterGenState: (state) =>
        set((prevState) => ({
          characterGenState: { ...prevState.characterGenState, ...state },
        })),
      setCurrentFrameGenerationId: (id) =>
        set({ currentFrameGenerationId: id }),
      setSequenceGenerationId: (id) => set({ sequenceGenerationId: id }),
      setLightboxOpen: (isOpen) => set({ lightboxOpen: isOpen }),
    }),
    {
      name: "frame-lab-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Don't persist File objects, but persist the data URL
        characterImageDataUrl: state.characterImageDataUrl,
        poseData: state.poseData,
        outputSize: state.outputSize,
        finalSpriteSheet: state.finalSpriteSheet,
      }),
    }
  )
);
