"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store";

export function useAnimationPlayback() {
  const isPlaying = useStore((state) => state.isPlaying);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      lastTimeRef.current = null;
      return;
    }

    const animate = (time: number) => {
      if (lastTimeRef.current != null) {
        const deltaTime = time - lastTimeRef.current;
        const frameInterval = 1000 / useStore.getState().fps;

        if (deltaTime > frameInterval) {
          lastTimeRef.current = time - (deltaTime % frameInterval);
          const currentFrame = useStore.getState().selectedFrame;
          const frameCount = useStore.getState().skeletons.length;
          useStore.getState().setSelectedFrame((currentFrame + 1) % frameCount);
        }
      } else {
        lastTimeRef.current = time;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying]);
}
