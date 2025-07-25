/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Skeleton, DEFAULT_SKELETON, Joint, HIERARCHY } from "@/lib/pose-data";
import { getAbsoluteRotation, updateChildrenPositions } from "@/lib/pose-utils";

export type OutputSize = "256x256" | "512x512" | "768x768" | "1024x1024";

export type ViewMode = "pose-only" | "image-only" | "stack";

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
  skeletons: Skeleton[];
  frameImages: (string | null)[]; // Array of image URLs for each frame
  generationState: GenerationState;
  finalSpriteSheet: string | null;
  outputSize: OutputSize;
  characterGenState: CharacterGenerationState;
  currentFrameGenerationId: string | null;
  sequenceGenerationId: string | null;
  lightboxOpen: boolean;
  selectedFrame: number;
  stageDimensions: { width: number; height: number };
  initialCenteringDone: boolean;
  isPlaying: boolean;
  fps: number;
  viewMode: ViewMode;
  poseClipboard: Skeleton | null;
  lastAddedFrame: number | null;
  setCharacterImage: (image: File | null) => void;
  setCharacterImageDataUrl: (dataUrl: string | null) => void;
  setPoseData: (index: number, data: Skeleton) => void;
  setJointRotation: (
    frameIndex: number,
    jointId: string,
    rotation: number
  ) => void;
  translateSkeleton: (frameIndex: number, dx: number, dy: number) => void;
  setGenerationState: (state: GenerationState) => void;
  setFinalSpriteSheet: (url: string | null) => void;
  setOutputSize: (size: OutputSize) => void;
  setCharacterGenState: (state: Partial<CharacterGenerationState>) => void;
  setCurrentFrameGenerationId: (id: string | null) => void;
  setSequenceGenerationId: (id: string | null) => void;
  setLightboxOpen: (isOpen: boolean) => void;
  setSelectedFrame: (index: number) => void;
  setStageDimensions: (dimensions: { width: number; height: number }) => void;
  centerAllSkeletons: () => void;
  toggleIsPlaying: () => void;
  setFps: (fps: number) => void;
  loadSkeletons: (skeletons: Skeleton[]) => void;
  addFrame: () => void;
  deleteFrame: () => void;
  copyPose: () => void;
  pastePose: () => void;
  duplicateFrame: () => void;
  setFrameImage: (frameIndex: number, imageUrl: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      characterImage: null,
      characterImageDataUrl: null,
      skeletons: Array(10).fill(DEFAULT_SKELETON),
      frameImages: Array(10).fill(null),
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
      selectedFrame: 0,
      stageDimensions: { width: 0, height: 0 },
      initialCenteringDone: false,
      isPlaying: false,
      fps: 24,
      viewMode: "stack" as ViewMode,
      poseClipboard: null,
      lastAddedFrame: null,

      setStageDimensions: (dimensions) => set({ stageDimensions: dimensions }),

      centerAllSkeletons: () =>
        set((state) => {
          const { skeletons, stageDimensions } = state;
          if (
            stageDimensions.width === 0 ||
            stageDimensions.height === 0 ||
            !skeletons ||
            skeletons.length === 0
          ) {
            return {}; // Not ready
          }

          // Calculate bounding box of the *first frame* only
          const firstSkeleton = skeletons[0];
          if (!firstSkeleton || firstSkeleton.length === 0) return {};

          const { minX, minY, maxX, maxY } = firstSkeleton.reduce(
            (acc, joint) => ({
              minX: Math.min(acc.minX, joint.x),
              minY: Math.min(acc.minY, joint.y),
              maxX: Math.max(acc.maxX, joint.x),
              maxY: Math.max(acc.maxY, joint.y),
            }),
            {
              minX: Infinity,
              minY: Infinity,
              maxX: -Infinity,
              maxY: -Infinity,
            }
          );

          const skeletonCenterX = minX + (maxX - minX) / 2;
          const skeletonCenterY = minY + (maxY - minY) / 2;
          const dx = stageDimensions.width / 2 - skeletonCenterX;
          const dy = stageDimensions.height / 2 - skeletonCenterY;

          // Apply the same translation to all frames in the animation
          const centeredSkeletons = skeletons.map((skeleton) =>
            skeleton.map((joint) => ({
              ...joint,
              x: joint.x + dx,
              y: joint.y + dy,
            }))
          );

          return { skeletons: centeredSkeletons, initialCenteringDone: true };
        }),

      setCharacterImage: (image) => set({ characterImage: image }),

      setCharacterImageDataUrl: (dataUrl) =>
        set({ characterImageDataUrl: dataUrl }),

      setPoseData: (index, data) =>
        set((state) => ({
          skeletons: state.skeletons.map((s, i) => (i === index ? data : s)),
        })),

      setJointRotation: (frameIndex, jointId, newRelativeRotation) =>
        set((state) => {
          const newSkeletons = [...state.skeletons];
          const targetSkeleton = JSON.parse(
            JSON.stringify(newSkeletons[frameIndex])
          );
          const jointsById = Object.fromEntries(
            targetSkeleton.map((j: Joint) => [j.id, j])
          );

          const targetJoint = jointsById[jointId];
          if (!targetJoint || !targetJoint.parentId) return {};

          // 1. Update the joint's relative rotation
          targetJoint.rotation = newRelativeRotation;

          // 2. Update the position of the dragged joint
          const parent = jointsById[targetJoint.parentId];
          const targetAbsRotation = getAbsoluteRotation(
            targetJoint.id,
            jointsById
          );
          targetJoint.x =
            parent.x + Math.cos(targetAbsRotation) * targetJoint.length;
          targetJoint.y =
            parent.y + Math.sin(targetAbsRotation) * targetJoint.length;

          // 3. Recursively update positions of all children
          updateChildrenPositions(targetJoint.id, targetSkeleton, jointsById);

          newSkeletons[frameIndex] = targetSkeleton;
          return { skeletons: newSkeletons };
        }),

      translateSkeleton: (frameIndex, dx, dy) =>
        set((state) => {
          const newSkeletons = [...state.skeletons];
          newSkeletons[frameIndex] = newSkeletons[frameIndex].map((joint) => ({
            ...joint,
            x: joint.x + dx,
            y: joint.y + dy,
          }));
          return { skeletons: newSkeletons };
        }),

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
      setSelectedFrame: (index) => set({ selectedFrame: index }),
      toggleIsPlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setFps: (fps) => set({ fps }),
      loadSkeletons: (skeletons) =>
        set({
          skeletons,
          frameImages: Array(skeletons.length).fill(null),
          selectedFrame: 0,
          lastAddedFrame: null,
          initialCenteringDone: false,
        }),
      addFrame: () =>
        set((state) => {
          const newSkeleton = JSON.parse(
            JSON.stringify(state.skeletons[state.selectedFrame])
          );
          const newSkeletons = [
            ...state.skeletons.slice(0, state.selectedFrame + 1),
            newSkeleton,
            ...state.skeletons.slice(state.selectedFrame + 1),
          ];
          const newFrameImages = [
            ...state.frameImages.slice(0, state.selectedFrame + 1),
            null, // No image for new frame initially
            ...state.frameImages.slice(state.selectedFrame + 1),
          ];
          return {
            skeletons: newSkeletons,
            frameImages: newFrameImages,
            selectedFrame: state.selectedFrame + 1,
            lastAddedFrame: state.selectedFrame + 1,
          };
        }),
      duplicateFrame: () =>
        set((state) => {
          const newSkeleton = JSON.parse(
            JSON.stringify(state.skeletons[state.selectedFrame])
          );
          const newSkeletons = [
            ...state.skeletons.slice(0, state.selectedFrame + 1),
            newSkeleton,
            ...state.skeletons.slice(state.selectedFrame + 1),
          ];
          const newFrameImages = [
            ...state.frameImages.slice(0, state.selectedFrame + 1),
            state.frameImages[state.selectedFrame], // Copy the image from the duplicated frame
            ...state.frameImages.slice(state.selectedFrame + 1),
          ];
          return {
            skeletons: newSkeletons,
            frameImages: newFrameImages,
            selectedFrame: state.selectedFrame + 1,
            lastAddedFrame: state.selectedFrame + 1,
          };
        }),
      deleteFrame: () =>
        set((state) => {
          if (state.skeletons.length <= 1) return {};
          const newSkeletons = state.skeletons.filter(
            (_, index) => index !== state.selectedFrame
          );
          const newFrameImages = state.frameImages.filter(
            (_, index) => index !== state.selectedFrame
          );
          return {
            skeletons: newSkeletons,
            frameImages: newFrameImages,
            selectedFrame: Math.max(0, state.selectedFrame - 1),
            lastAddedFrame: null,
          };
        }),
      copyPose: () =>
        set((state) => ({
          poseClipboard: JSON.parse(
            JSON.stringify(state.skeletons[state.selectedFrame])
          ),
          lastAddedFrame: null,
        })),
      pastePose: () =>
        set((state) => {
          if (!state.poseClipboard) return {};
          const newSkeletons = [...state.skeletons];
          newSkeletons[state.selectedFrame] = JSON.parse(
            JSON.stringify(state.poseClipboard)
          );
          return { skeletons: newSkeletons, lastAddedFrame: null };
        }),
      setFrameImage: (frameIndex: number, imageUrl: string | null) =>
        set((state) => {
          const newFrameImages = [...state.frameImages];
          newFrameImages[frameIndex] = imageUrl;
          return { frameImages: newFrameImages };
        }),
      setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
    }),
    {
      name: "frame-lab-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Don't persist File objects, but persist the data URL
        characterImageDataUrl: state.characterImageDataUrl,
        skeletons: state.skeletons,
        frameImages: state.frameImages,
        outputSize: state.outputSize,
        finalSpriteSheet: state.finalSpriteSheet,
        selectedFrame: state.selectedFrame,
        fps: state.fps,
        viewMode: state.viewMode,
      }),
    }
  )
);
