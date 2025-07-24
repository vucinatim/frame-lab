"use client";

import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PosePreview } from "./pose-preview";

interface AnimationFrameProps {
  frame: {
    image?: string;
    skeleton: import("@/lib/pose-data").Skeleton;
  };
  index: number;
}

export function AnimationFrame({ frame, index }: AnimationFrameProps) {
  const { selectedFrame, setSelectedFrame } = useStore();
  const isSelected = selectedFrame === index;

  return (
    <div
      className={cn(
        "relative w-24 h-24 rounded-md overflow-hidden cursor-pointer border-2 group",
        isSelected ? "border-blue-500" : "border-transparent"
      )}
      onClick={() => setSelectedFrame(index)}
    >
      {frame.image && (
        <Image
          src={frame.image}
          alt={`Frame ${index + 1}`}
          fill
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
      <div className="absolute inset-0">
        <PosePreview skeleton={frame.skeleton} width={96} height={96} />
      </div>
    </div>
  );
}
