"use client";

import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Circle, Line } from "react-konva";
import { useStore } from "@/store";
import { KonvaEventObject } from "konva/lib/Node";
import { BONES, Joint } from "@/lib/pose-data";

const PoseEditor = () => {
  const { poseData, setJointRotation, translateSkeleton } = useStore();
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const lastDragPos = useRef({ x: 0, y: 0 });
  const jointsById = Object.fromEntries(poseData.map((j) => [j.id, j]));

  useEffect(() => {
    // A little hack to make sure the container is rendered before we get its size
    setTimeout(() => {
      const container = document.getElementById("editor-container");
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    }, 100);
  }, []);

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
      translateSkeleton(dx, dy);
      lastDragPos.current = currentPos;
      return;
    }

    if (!joint.parentId) return;

    const parent = jointsById[joint.parentId];
    if (!parent) return;

    const dx = e.target.x() - parent.x;
    const dy = e.target.y() - parent.y;
    const newAbsoluteRotation = Math.atan2(dy, dx);

    let parentAbsoluteRotation = 0;
    let current: Joint | null = parent;
    while (current) {
      parentAbsoluteRotation += current.rotation;
      current = current.parentId ? jointsById[current.parentId] : null;
    }

    const newRelativeRotation = newAbsoluteRotation - parentAbsoluteRotation;
    setJointRotation(jointId, newRelativeRotation);
  };

  return (
    <div id="editor-container" className="w-full h-full">
      <Stage width={stageSize.width} height={stageSize.height}>
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
                stroke="black"
                strokeWidth={4}
              />
            );
          })}

          {/* Render joints */}
          {poseData.map((joint) => (
            <Circle
              key={joint.id}
              x={joint.x}
              y={joint.y}
              radius={8}
              fill={joint.id === "hip" ? "blue" : "red"}
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
