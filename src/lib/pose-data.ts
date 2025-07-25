export const OPENPOSE_KEYPOINTS = [
  "Nose",
  "Neck",
  "RShoulder",
  "RElbow",
  "RWrist",
  "LShoulder",
  "LElbow",
  "LWrist",
  "RHip",
  "RKnee",
  "RAnkle",
  "LHip",
  "LKnee",
  "LAnkle",
  "REye",
  "LEye",
  "REar",
  "LEar",
] as const;

export type OpenPoseKeypoint = (typeof OPENPOSE_KEYPOINTS)[number];

export type OpenPoseSkeleton = Partial<
  Record<OpenPoseKeypoint, [number, number]>
>;

export const LIMB_CONNECTIONS: {
  points: [OpenPoseKeypoint, OpenPoseKeypoint];
  color: string;
}[] = [
  // Head
  { points: ["Nose", "Neck"], color: "rgb(0, 0, 255)" }, // Blue
  { points: ["Nose", "REye"], color: "rgb(255, 0, 255)" }, // Magenta
  { points: ["Nose", "LEye"], color: "rgb(255, 0, 255)" }, // Magenta
  { points: ["REye", "REar"], color: "rgb(255, 0, 170)" }, // Pink
  { points: ["LEye", "LEar"], color: "rgb(255, 0, 170)" }, // Pink

  // Torso
  { points: ["Neck", "RShoulder"], color: "rgb(255, 0, 0)" }, // Red
  { points: ["Neck", "LShoulder"], color: "rgb(85, 255, 0)" }, // Lime Green
  { points: ["Neck", "RHip"], color: "rgb(0, 255, 0)" }, // Green
  { points: ["Neck", "LHip"], color: "rgb(0, 255, 255)" }, // Cyan

  // Right Arm
  { points: ["RShoulder", "RElbow"], color: "rgb(255, 85, 0)" }, // Orange
  { points: ["RElbow", "RWrist"], color: "rgb(255, 170, 0)" }, // Yellow

  // Left Arm
  { points: ["LShoulder", "LElbow"], color: "rgb(170, 255, 0)" }, // Yellow-Green
  { points: ["LElbow", "LWrist"], color: "rgb(255, 255, 0)" }, // Bright Yellow

  // Right Leg
  { points: ["RHip", "RKnee"], color: "rgb(0, 255, 85)" }, // Aqua
  { points: ["RKnee", "RAnkle"], color: "rgb(0, 255, 170)" }, // Teal

  // Left Leg
  { points: ["LHip", "LKnee"], color: "rgb(0, 170, 255)" }, // Light Blue
  { points: ["LKnee", "LAnkle"], color: "rgb(0, 85, 255)" }, // Blue
];

// Re-creating the default positions in the new OpenPose format.
// Note: This is a T-Pose.
const DEFAULT_POSITIONS: OpenPoseSkeleton = {
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
};

export const DEFAULT_SKELETON: OpenPoseSkeleton = DEFAULT_POSITIONS;
