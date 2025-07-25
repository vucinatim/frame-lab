"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { OpenPoseSkeleton } from "@/lib/pose-data";
import { PosePreview } from "./pose-preview";

interface AnimationFrameProps {
  frame: {
    skeleton: OpenPoseSkeleton;
    image: string | null;
  };
  index: number;
}

export function AnimationFrame({ frame, index }: AnimationFrameProps) {
  const selectedFrame = useStore((state) => state.selectedFrame);
  const lastAddedFrame = useStore((state) => state.lastAddedFrame);
  const setSelectedFrame = useStore((state) => state.setSelectedFrame);
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
          className="object-contain"
        />
      )}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
      <div className="absolute inset-0 flex items-center justify-center">
        <PosePreview skeleton={frame.skeleton} />
      </div>
    </div>
  );
}
