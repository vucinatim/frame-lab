import { OpenPoseSkeleton } from "./pose-data";
// Import fallback animations for build-time and SSR
import animePoseData from "./animations/anime_pose.json";
import runCycleData from "./animations/run_cycle.json";
import walkCycleData from "./animations/walk_cycle.json";
import idleBreathData from "./animations/idle_breath.json";
import jumpCycleData from "./animations/jump_cycle.json";
import waveGestureData from "./animations/wave_gesture.json";

// Unified animation format - same structure everywhere
export interface Animation {
  name: string;
  fps: number;
  frames: OpenPoseSkeleton[];
  frameCount: number;
  exportDate: string;
  id?: string;
  filename?: string;
}

// Animation data interface for the JSON files
interface AnimationData {
  name: string;
  fps: number;
  frameCount: number;
  exportDate: string;
  frames: Record<string, [number, number]>[];
  id?: string;
  filename?: string;
}

// Convert the JSON format to our unified format
function createAnimationFromJSON(data: AnimationData): Animation {
  return {
    name: data.name,
    fps: data.fps,
    frameCount: data.frameCount,
    exportDate: data.exportDate,
    frames: data.frames as OpenPoseSkeleton[], // Direct cast since the structure is the same
    id: data.id,
    filename: data.filename,
  };
}

// Fetch animations dynamically from the API
export async function loadAnimationsFromAPI(): Promise<Animation[]> {
  try {
    const response = await fetch("/api/animations");
    if (!response.ok) {
      throw new Error(`Failed to fetch animations: ${response.statusText}`);
    }

    const { animations } = await response.json();
    return animations.map((data: AnimationData) =>
      createAnimationFromJSON(data)
    );
  } catch (error) {
    console.error("Error loading animations from API:", error);
    return getStaticAnimations();
  }
}

// Static animations for fallback and build-time
function getStaticAnimations(): Animation[] {
  const animations: Animation[] = [];

  try {
    // Add all static animation files here
    const animationDataFiles = [
      { ...animePoseData, id: "anime_pose", filename: "anime_pose.json" },
      { ...runCycleData, id: "run_cycle", filename: "run_cycle.json" },
      { ...walkCycleData, id: "walk_cycle", filename: "walk_cycle.json" },
      { ...idleBreathData, id: "idle_breath", filename: "idle_breath.json" },
      { ...jumpCycleData, id: "jump_cycle", filename: "jump_cycle.json" },
      { ...waveGestureData, id: "wave_gesture", filename: "wave_gesture.json" },
      // Add new animation files here when you add them to the animations folder
    ];

    animationDataFiles.forEach((data) => {
      const animation = createAnimationFromJSON(
        data as unknown as AnimationData
      );
      animations.push(animation);
    });
  } catch (error) {
    console.warn("Could not load static animations:", error);
  }

  // Sort animations alphabetically by name
  return animations.sort((a, b) => a.name.localeCompare(b.name));
}

// Static presets for build-time and initial load
export const animationPresets: Animation[] = getStaticAnimations();

// The default animation is the first one alphabetically, or anime_pose if available
export const DEFAULT_ANIMATION: Animation = animationPresets.find(
  (anim) => anim.name === "Anime Pose"
) ||
  animationPresets[0] || {
    name: "Default T-Pose",
    fps: 8,
    frameCount: 1,
    exportDate: new Date().toISOString(),
    frames: [
      {
        Nose: [256, 80],
        Neck: [256, 120],
        LShoulder: [306, 120],
        LElbow: [356, 120],
        LWrist: [406, 120],
        RShoulder: [206, 120],
        RElbow: [156, 120],
        RWrist: [106, 120],
        LHip: [281, 240],
        LKnee: [281, 320],
        LAnkle: [281, 400],
        RHip: [231, 240],
        RKnee: [231, 320],
        RAnkle: [231, 400],
        LEye: [271, 70],
        REye: [241, 70],
        LEar: [286, 70],
        REar: [226, 70],
      },
    ],
  };

export function getDefaultAnimation(): OpenPoseSkeleton[] {
  return DEFAULT_ANIMATION.frames;
}

export function getDefaultAnimationFps(): number {
  return DEFAULT_ANIMATION.fps;
}

export function getDefaultAnimationFrameCount(): number {
  return DEFAULT_ANIMATION.frameCount;
}

// Export the async loader for dynamic loading if needed
export const loadAllAnimations = loadAnimationsFromAPI;
