"use client";
import { useEffect, useRef } from "react";
import { OpenPoseSkeleton, LIMB_CONNECTIONS } from "@/lib/pose-data";

interface PosePreviewProps {
  skeleton: OpenPoseSkeleton;
}

export function PosePreview({ skeleton }: PosePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    // ctx.fillStyle = "black";
    // ctx.fillRect(0, 0, width, height);

    if (!skeleton || Object.keys(skeleton).length === 0) return;

    // Calculate scale and offset to fit the skeleton in the canvas
    const coords = Object.values(skeleton);
    const minX = Math.min(...coords.map((c) => c![0]));
    const minY = Math.min(...coords.map((c) => c![1]));
    const maxX = Math.max(...coords.map((c) => c![0]));
    const maxY = Math.max(...coords.map((c) => c![1]));

    const skeletonWidth = maxX - minX;
    const skeletonHeight = maxY - minY;
    const scale = Math.min(
      (width - 20) / skeletonWidth,
      (height - 20) / skeletonHeight
    );
    const offsetX = (width - skeletonWidth * scale) / 2 - minX * scale;
    const offsetY = (height - skeletonHeight * scale) / 2 - minY * scale;

    const transform = (p: [number, number]): [number, number] => {
      return [p[0] * scale + offsetX, p[1] * scale + offsetY];
    };

    // Draw limbs
    ctx.lineWidth = 2;
    for (const limb of LIMB_CONNECTIONS) {
      const p1_name = limb.points[0];
      const p2_name = limb.points[1];
      const p1 = skeleton[p1_name];
      const p2 = skeleton[p2_name];
      if (p1 && p2) {
        const tp1 = transform(p1);
        const tp2 = transform(p2);
        ctx.strokeStyle = limb.color;
        ctx.beginPath();
        ctx.moveTo(tp1[0], tp1[1]);
        ctx.lineTo(tp2[0], tp2[1]);
        ctx.stroke();
      }
    }
  }, [skeleton]);

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={100}
      className="rounded-md border"
    />
  );
}
