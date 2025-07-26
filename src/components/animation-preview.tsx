"use client";

import React from "react";
import { PosePreview } from "./pose-preview";
import { type Animation } from "@/lib/animation-presets";

interface AnimationPreviewProps {
  animation: Animation;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function AnimationPreview({
  animation,
  size = "sm",
  className = "",
}: AnimationPreviewProps) {
  const [currentFrameIndex, setCurrentFrameIndex] = React.useState(0);

  // Get size dimensions
  const dimensions = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  // Animation loop effect
  React.useEffect(() => {
    if (animation.frames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % animation.frames.length);
    }, 1000 / animation.fps);

    return () => clearInterval(interval);
  }, [animation.frames.length, animation.fps]);

  // Reset frame when animation changes
  React.useEffect(() => {
    setCurrentFrameIndex(0);
  }, [animation]);

  if (animation.frames.length === 0) {
    return (
      <div
        className={`${dimensions[size]} ${className} bg-zinc-800 rounded flex items-center justify-center`}
      >
        <span className="text-xs text-gray-400">?</span>
      </div>
    );
  }

  const currentFrame = animation.frames[currentFrameIndex];

  return (
    <div
      className={`${dimensions[size]} ${className} relative bg-black rounded border flex items-center justify-center overflow-hidden`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="scale-[0.3] origin-center">
          <PosePreview skeleton={currentFrame} />
        </div>
      </div>
    </div>
  );
}
