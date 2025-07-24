"use client";

import { useEffect, useRef } from "react";
import { Skeleton } from "@/lib/pose-data";

interface PosePreviewProps {
  skeleton: Skeleton;
  width: number;
  height: number;
}

export function PosePreview({ skeleton, width, height }: PosePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- Start of new scaling logic ---

    // 1. Find the bounding box of the skeleton
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    skeleton.forEach((joint) => {
      minX = Math.min(minX, joint.x);
      minY = Math.min(minY, joint.y);
      maxX = Math.max(maxX, joint.x);
      maxY = Math.max(maxY, joint.y);
    });

    const skelWidth = maxX - minX;
    const skelHeight = maxY - minY;

    // 2. Calculate scale factor and translation
    const padding = 10; // 10px padding
    const scaleX = (width - padding * 2) / skelWidth;
    const scaleY = (height - padding * 2) / skelHeight;
    const scale = Math.min(scaleX, scaleY);

    const translateX = (width - skelWidth * scale) / 2 - minX * scale;
    const translateY = (height - skelHeight * scale) / 2 - minY * scale;

    // 3. Apply transformation and draw
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(translateX, translateY);
    ctx.scale(scale, scale);

    // Set styles
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2 / scale; // Adjust line width based on scale

    // Draw skeleton
    skeleton.forEach((joint) => {
      if (joint.parentId) {
        const parentJoint = skeleton.find((j) => j.id === joint.parentId);
        if (parentJoint) {
          ctx.beginPath();
          ctx.moveTo(parentJoint.x, parentJoint.y);
          ctx.lineTo(joint.x, joint.y);
          ctx.stroke();
        }
      }
    });

    ctx.restore(); // Restore original transformation

    // --- End of new scaling logic ---
  }, [skeleton, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
