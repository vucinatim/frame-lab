"use client";

import React, { useState, useEffect } from "react";
import { Stage, Layer, Circle } from "react-konva";
import { useStore } from "@/store";
import { KonvaEventObject } from "konva/lib/Node";

const PoseEditor = () => {
  const { poseData, setPoseData } = useStore();
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setStageSize({
      width: window.innerWidth / 2,
      height: window.innerHeight - 200,
    });
  }, []);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const newPos = { x: e.target.x(), y: e.target.y() };
    setPosition(newPos);
    // We'll update the global store later with the full skeleton data
    // setPoseData(newPos);
  };

  return (
    <Stage width={stageSize.width} height={stageSize.height}>
      <Layer>
        <Circle
          x={position.x}
          y={position.y}
          radius={20}
          fill="red"
          draggable
          onDragEnd={handleDragEnd}
        />
      </Layer>
    </Stage>
  );
};

export default PoseEditor;
