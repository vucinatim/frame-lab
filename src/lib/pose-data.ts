import { Vector2d } from "konva/lib/types";

export interface Joint {
  id: string;
  x: number;
  y: number;
  // rotation in radians relative to the parent joint
  rotation: number;
  // length of the bone connecting this joint to its parent
  length: number;
  parentId: string | null;
}

export type Skeleton = Joint[];

export type Bone = [string, string];

export const BONES: Bone[] = [
  ["hip", "neck"],
  ["neck", "nose"],
  ["nose", "left_eye"],
  ["nose", "right_eye"],
  ["left_eye", "left_ear"],
  ["right_eye", "right_ear"],
  ["neck", "left_shoulder"],
  ["neck", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["hip", "left_hip"],
  ["hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["right_hip", "right_knee"],
  ["left_knee", "left_ankle"],
  ["right_knee", "right_ankle"],
];

// Define a mapping for parent-child relationships
export const HIERARCHY: Record<string, string[]> = BONES.reduce(
  (acc, [parent, child]) => {
    if (!acc[parent]) {
      acc[parent] = [];
    }
    acc[parent].push(child);
    return acc;
  },
  {} as Record<string, string[]>
);

// Raw default positions to calculate initial skeleton
const DEFAULT_POSITIONS: Record<string, Vector2d> = {
  nose: { x: 250, y: 100 },
  left_eye: { x: 240, y: 95 },
  right_eye: { x: 260, y: 95 },
  left_ear: { x: 230, y: 100 },
  right_ear: { x: 270, y: 100 },
  neck: { x: 250, y: 120 },
  left_shoulder: { x: 220, y: 130 },
  right_shoulder: { x: 280, y: 130 },
  left_elbow: { x: 210, y: 180 },
  right_elbow: { x: 290, y: 180 },
  left_wrist: { x: 200, y: 230 },
  right_wrist: { x: 300, y: 230 },
  hip: { x: 250, y: 250 },
  left_hip: { x: 230, y: 250 },
  right_hip: { x: 270, y: 250 },
  left_knee: { x: 220, y: 320 },
  right_knee: { x: 280, y: 320 },
  left_ankle: { x: 210, y: 390 },
  right_ankle: { x: 290, y: 390 },
};

// Function to generate the skeleton with calculated properties
function createDefaultSkeleton(): Skeleton {
  const skeleton: Skeleton = [];
  const jointIds = Object.keys(DEFAULT_POSITIONS);

  const parentMap: Record<string, string | null> = { hip: null };
  BONES.forEach(([parent, child]) => {
    parentMap[child] = parent;
  });

  jointIds.forEach((id) => {
    const pos = DEFAULT_POSITIONS[id];
    const parentId = parentMap[id];
    let length = 0;
    let rotation = 0;

    if (parentId) {
      const parentPos = DEFAULT_POSITIONS[parentId];
      const dx = pos.x - parentPos.x;
      const dy = pos.y - parentPos.y;
      length = Math.sqrt(dx * dx + dy * dy);

      // Find grandparent to calculate relative rotation
      const grandparentId = parentMap[parentId];
      if (grandparentId) {
        const grandparentPos = DEFAULT_POSITIONS[grandparentId];
        const parentRotation = Math.atan2(
          parentPos.y - grandparentPos.y,
          parentPos.x - grandparentPos.x
        );
        const absoluteRotation = Math.atan2(dy, dx);
        rotation = absoluteRotation - parentRotation;
      } else {
        // Parent is the root
        rotation = Math.atan2(dy, dx);
      }
    }

    skeleton.push({
      id,
      x: pos.x,
      y: pos.y,
      parentId,
      length,
      rotation,
    });
  });

  return skeleton;
}

export const DEFAULT_SKELETON: Skeleton = createDefaultSkeleton();
