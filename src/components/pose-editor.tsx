"use client";

import React, { useEffect, useRef } from "react";
import { Stage, Layer, Circle, Line } from "react-konva";
import { useStore } from "@/store";
import { KonvaEventObject } from "konva/lib/Node";
import { BONES } from "@/lib/pose-data";
import { getAbsoluteRotation } from "@/lib/pose-utils";

const PoseEditor = () => {
  const skeletons = useStore((state) => state.skeletons);
  const selectedFrame = useStore((state) => state.selectedFrame);
  const stageDimensions = useStore((state) => state.stageDimensions);
  const initialCenteringDone = useStore((state) => state.initialCenteringDone);

  const setJointRotation = useStore((state) => state.setJointRotation);
  const translateSkeleton = useStore((state) => state.translateSkeleton);
  const setStageDimensions = useStore((state) => state.setStageDimensions);
  const centerAllSkeletons = useStore((state) => state.centerAllSkeletons);
  const poseData = skeletons[selectedFrame];
  const lastDragPos = useRef({ x: 0, y: 0 });
  const jointsById =
    poseData && Object.fromEntries(poseData.map((j) => [j.id, j]));

  useEffect(() => {
    // A little hack to make sure the container is rendered before we get its size
    setTimeout(() => {
      const container = document.getElementById("editor-container");
      if (container) {
        setStageDimensions({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    }, 100);
  }, [setStageDimensions]);

  useEffect(() => {
    // Center the skeleton when a new preset is loaded
    if (stageDimensions.width > 0 && !initialCenteringDone) {
      centerAllSkeletons();
    }
  }, [stageDimensions, initialCenteringDone, centerAllSkeletons, skeletons]);

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    lastDragPos.current = { x: e.target.x(), y: e.target.y() };
  };

  const handleJointDrag = (e: KonvaEventObject<DragEvent>, jointId: string) => {
    const joint = jointsById[jointId];
    if (!joint) return;

    if (joint.id === "hip") {
      const currentPos = { x: e.target.x(), y: e.target.y() };
      const dx = currentPos.x - lastDragPos.current.x;
      const dy = currentPos.y - lastDragPos.current.y;
      translateSkeleton(selectedFrame, dx, dy);
      lastDragPos.current = currentPos;
      return;
    }

    if (!joint.parentId) return;

    const parent = jointsById[joint.parentId];
    if (!parent) return;

    const dx = e.target.x() - parent.x;
    const dy = e.target.y() - parent.y;
    const newAbsoluteRotation = Math.atan2(dy, dx);

    const parentAbsoluteRotation = getAbsoluteRotation(parent.id, jointsById);
    const newRelativeRotation = newAbsoluteRotation - parentAbsoluteRotation;

    setJointRotation(selectedFrame, jointId, newRelativeRotation);
  };

  return (
    <div id="editor-container" className="w-full h-full">
      <Stage width={stageDimensions.width} height={stageDimensions.height}>
        <Layer>
          {/* Render bones */}
          {BONES.map(([j1Id, j2Id], i) => {
            const j1 = jointsById[j1Id];
            const j2 = jointsById[j2Id];
            if (!j1 || !j2) return null;
            return (
              <Line
                key={`bone-${i}`}
                points={[j1.x, j1.y, j2.x, j2.y]}
                stroke="white"
                strokeWidth={4}
              />
            );
          })}

          {/* Render joints */}
          {poseData &&
            poseData.map((joint) => (
              <Circle
                key={joint.id}
                x={joint.x}
                y={joint.y}
                radius={8}
                fill={joint.id === "hip" ? "yellow" : "magenta"}
                draggable
                onDragStart={handleDragStart}
                onDragMove={(e) => handleJointDrag(e, joint.id)}
              />
            ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default PoseEditor;
