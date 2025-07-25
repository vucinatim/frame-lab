"use client";

import { useEffect, useState } from "react";
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
  const { selectedFrame, setSelectedFrame, lastAddedFrame } = useStore();
  const isSelected = selectedFrame === index;
  const isNewlyAdded = lastAddedFrame === index;
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isNewlyAdded) {
      setAnimate(true);
      const timer = setTimeout(() => {
        setAnimate(false);
      }, 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [isNewlyAdded]);

  return (
    <div
      className={cn(
        "relative w-24 h-24 rounded-md overflow-hidden cursor-pointer border-2 group transition-colors duration-250",
        isSelected ? "border-sky-500" : "border-transparent",
        animate && "bg-sky-200"
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
