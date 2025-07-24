import { Skeleton, DEFAULT_SKELETON, HIERARCHY } from "./pose-data";
import { getAbsoluteRotation } from "./pose-utils";

// Helper function to create a slightly modified skeleton for variety
const createModifiedSkeleton = (base: Skeleton, offset: number): Skeleton => {
  // Create a deep copy to avoid mutating the original
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

  // 2. Recalculate all x, y positions using Forward Kinematics
  const updatePositionsRecursively = (parentId: string) => {
    const parentJoint = jointsById[parentId];
    if (!parentJoint) return;

    const childrenIds = HIERARCHY[parentId] || [];

    childrenIds.forEach((childId) => {
      const childJoint = jointsById[childId];
      if (childJoint) {
        const absoluteRotation = getAbsoluteRotation(childId, jointsById);
        childJoint.x =
          parentJoint.x + Math.cos(absoluteRotation) * childJoint.length;
        childJoint.y =
          parentJoint.y + Math.sin(absoluteRotation) * childJoint.length;
        updatePositionsRecursively(childId);
      }
    });
  };

  updatePositionsRecursively("hip");

  return newSkeleton;
};

const WALK_ANIMATION: Skeleton[] = Array.from({ length: 8 }, (_, i) =>
  createModifiedSkeleton(DEFAULT_SKELETON, i * 0.8)
);

const RUN_ANIMATION: Skeleton[] = Array.from({ length: 6 }, (_, i) =>
  createModifiedSkeleton(DEFAULT_SKELETON, i * 1.2)
);

const IDLE_ANIMATION: Skeleton[] = Array.from({ length: 12 }, (_, i) =>
  createModifiedSkeleton(DEFAULT_SKELETON, i * 0.4)
);

const DEFAULT_ANIMATION: Skeleton[] = [DEFAULT_SKELETON];

export const PRESETS: Record<string, Skeleton[]> = {
  Default: DEFAULT_ANIMATION,
  Walk: WALK_ANIMATION,
  Run: RUN_ANIMATION,
  Idle: IDLE_ANIMATION,
};
