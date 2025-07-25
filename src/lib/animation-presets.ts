import { OpenPoseSkeleton, DEFAULT_SKELETON } from "./pose-data";

export interface AnimationPreset {
  name: string;
  animation: OpenPoseSkeleton[];
}

const handWaveFrame1: OpenPoseSkeleton = {
  ...DEFAULT_SKELETON,
  // Arms down
  RElbow: [206, 180],
  RWrist: [206, 240],
  LElbow: [306, 180],
  LWrist: [306, 240],
};

const handWaveFrame2: OpenPoseSkeleton = {
  ...handWaveFrame1,
  // Right arm up
  RElbow: [156, 80],
  RWrist: [106, 40],
};

const handWaveFrame3: OpenPoseSkeleton = {
  ...handWaveFrame1,
  // Right arm further up
  RElbow: [186, 60],
  RWrist: [226, 20],
};

export const PRESETS: AnimationPreset[] = [
  {
    name: "Default T-Pose",
    // Deep copy to prevent mutation
    animation: JSON.parse(JSON.stringify([DEFAULT_SKELETON])),
  },
  {
    name: "Hand Wave",
    animation: JSON.parse(
      JSON.stringify([
        handWaveFrame1,
        handWaveFrame2,
        handWaveFrame3,
        handWaveFrame2,
        handWaveFrame1,
      ])
    ),
  },
];
