import { Skeleton, DEFAULT_SKELETON } from "./pose-data";
import { updateChildrenPositions } from "./pose-utils";

// Import the hand wave animation from JSON
import handWaveData from "./animations/hand-wave.json";

// Helper function to create a slightly modified skeleton for variety
const createModifiedSkeleton = (base: Skeleton, offset: number): Skeleton => {
  const newSkeleton = JSON.parse(JSON.stringify(base)) as Skeleton;
  const jointsById = Object.fromEntries(newSkeleton.map((j) => [j.id, j]));

  // 1. Modify the rotation of each joint procedurally
  newSkeleton.forEach((joint) => {
    // We only want to animate joints that have a parent
    if (joint.parentId) {
      // Add a small rotation offset based on a sine wave.
      // This creates a simple, smooth oscillation.
      const rotationOffset = Math.sin(offset + joint.y / 50) * 0.1; // Small rotation change
      joint.rotation += rotationOffset;
    }
  });

  // 2. Recalculate all positions using the centralized utility
  updateChildrenPositions("hip", newSkeleton, jointsById);

  return newSkeleton;
};

// New helper to apply a specific pose (map of joint rotations) to a skeleton
const applyPose = (
  base: Skeleton,
  pose: { [jointId: string]: number }
): Skeleton => {
  const newSkeleton = JSON.parse(JSON.stringify(base)) as Skeleton;
  const jointsById = Object.fromEntries(newSkeleton.map((j) => [j.id, j]));

  // 1. Apply new relative rotations from the pose object
  for (const jointId in pose) {
    if (jointsById[jointId]) {
      jointsById[jointId].rotation = pose[jointId];
    }
  }

  // 2. Recalculate all positions using the centralized utility
  updateChildrenPositions("hip", newSkeleton, jointsById);

  return newSkeleton;
};
const WIGGLE_ANIMATION: Skeleton[] = Array.from({ length: 12 }, (_, i) =>
  createModifiedSkeleton(DEFAULT_SKELETON, i * 0.4)
);

// --- Loading Hand Wave animation from JSON ---
const HAND_WAVE_ANIMATION: Skeleton[] = handWaveData.frames as Skeleton[];

// --- Manually creating a simple debug pose ---
const DEBUG_POSE = {
  right_shoulder: Math.PI / 2, // 90 degrees right
  left_shoulder: -Math.PI / 2, // 90 degrees left
};
const DEBUG_ANIMATION: Skeleton[] = [applyPose(DEFAULT_SKELETON, DEBUG_POSE)];
const DEFAULT_ANIMATION: Skeleton[] = [DEFAULT_SKELETON];

export const PRESETS: Record<string, Skeleton[]> = {
  Init: DEFAULT_ANIMATION,
  "Debug Pose": DEBUG_ANIMATION,
  Wiggle: WIGGLE_ANIMATION,
  "Hand Wave": HAND_WAVE_ANIMATION,
};
