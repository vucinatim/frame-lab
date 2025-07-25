"use client";
import React, { useRef, useEffect } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useStore } from "@/store";
import {
  LIMB_CONNECTIONS,
  OpenPoseKeypoint,
  OPENPOSE_KEYPOINTS,
} from "@/lib/pose-data";

const PoseEditor: React.FC = () => {
  const selectedFrame = useStore((state) => state.selectedFrame);
  const skeletons = useStore((state) => state.skeletons);
  const setJointPosition = useStore((state) => state.setJointPosition);
  const stageDimensions = useStore((state) => state.stageDimensions);
  const setStageDimensions = useStore((state) => state.setStageDimensions);
  const centerAllSkeletons = useStore((state) => state.centerAllSkeletons);
  const initialCenteringDone = useStore((state) => state.initialCenteringDone);

  const containerRef = useRef<HTMLDivElement>(null);
  const poseData = skeletons[selectedFrame];

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setStageDimensions({ width, height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setStageDimensions]);

  useEffect(() => {
    if (
      stageDimensions.width > 0 &&
      stageDimensions.height > 0 &&
      !initialCenteringDone
    ) {
      centerAllSkeletons();
    }
  }, [stageDimensions, initialCenteringDone, centerAllSkeletons, skeletons]);

  const handleJointDrag = (
    keypoint: OpenPoseKeypoint,
    e: KonvaEventObject<DragEvent>
  ) => {
    const newPos: [number, number] = [e.target.x(), e.target.y()];
    setJointPosition(selectedFrame, keypoint, newPos);
  };

  return (
    <div ref={containerRef} className="h-full w-full">
      <Stage width={stageDimensions.width} height={stageDimensions.height}>
        <Layer>
          {/* Render Limbs */}
          {LIMB_CONNECTIONS.map((limb, i) => {
            const p1_name = limb.points[0];
            const p2_name = limb.points[1];
            const p1 = poseData?.[p1_name];
            const p2 = poseData?.[p2_name];
            if (p1 && p2) {
              return (
                <Line
                  key={`limb-${i}`}
                  points={[p1[0], p1[1], p2[0], p2[1]]}
                  stroke={limb.color}
                  strokeWidth={4}
                />
              );
            }
            return null;
          })}

          {/* Render Keypoints */}
          {OPENPOSE_KEYPOINTS.map((keypoint) => {
            const pos = poseData?.[keypoint];
            if (pos) {
              return (
                <Circle
                  key={`joint-${keypoint}`}
                  x={pos[0]}
                  y={pos[1]}
                  radius={6}
                  fill="white"
                  stroke="black"
                  strokeWidth={2}
                  draggable
                  onDragMove={(e) => handleJointDrag(keypoint, e)}
                  onDragEnd={(e) => handleJointDrag(keypoint, e)}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default PoseEditor;
