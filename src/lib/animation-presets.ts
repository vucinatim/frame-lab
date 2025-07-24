import { Skeleton, DEFAULT_SKELETON } from "./pose-data";

// Helper function to create a slightly modified skeleton for variety
const createModifiedSkeleton = (base: Skeleton, offset: number): Skeleton => {
  return base.map((joint) => ({
    ...joint,
    x: joint.x + Math.sin(joint.y / 50 + offset) * 10,
    y: joint.y + Math.cos(joint.x / 50 + offset) * 5,
  }));
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
