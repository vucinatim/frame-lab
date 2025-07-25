"use client";
import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useStore } from "@/store";
import {
  LIMB_CONNECTIONS,
  OpenPoseKeypoint,
  OPENPOSE_KEYPOINTS,
} from "@/lib/pose-data";

// Define a clear parent-child hierarchy for the skeleton
const HIERARCHY: Partial<Record<OpenPoseKeypoint, OpenPoseKeypoint[]>> = {
  Neck: ["LShoulder", "RShoulder", "LHip", "RHip", "Nose"],
  LShoulder: ["LElbow"],
  LElbow: ["LWrist"],
  RShoulder: ["RElbow"],
  RElbow: ["RWrist"],
  LHip: ["LKnee"],
  LKnee: ["LAnkle"],
  RHip: ["RKnee"],
  RKnee: ["RAnkle"],
  Nose: ["LEye", "REye"],
  LEye: ["LEar"],
  REye: ["REar"],
};

const getDescendants = (
  keypoint: OpenPoseKeypoint,
  hierarchy: typeof HIERARCHY
): OpenPoseKeypoint[] => {
  const descendants: OpenPoseKeypoint[] = [];
  const children = hierarchy[keypoint];
  if (children) {
    descendants.push(...children);
    children.forEach((child) => {
      descendants.push(...getDescendants(child, hierarchy));
    });
  }
  return descendants;
};

const PoseEditor: React.FC = () => {
  const selectedFrame = useStore((state) => state.selectedFrame);
  const skeletons = useStore((state) => state.skeletons);
  const setMultipleJointPositions = useStore(
    (state) => state.setMultipleJointPositions
  );
  const stageDimensions = useStore((state) => state.stageDimensions);
  const setStageDimensions = useStore((state) => state.setStageDimensions);
  const centerAllSkeletons = useStore((state) => state.centerAllSkeletons);
  const initialCenteringDone = useStore((state) => state.initialCenteringDone);

  const containerRef = useRef<HTMLDivElement>(null);
  const poseData = skeletons[selectedFrame];

  const [draggedJoint, setDraggedJoint] = useState<{
    keypoint: OpenPoseKeypoint;
    descendants: OpenPoseKeypoint[];
    initialPositions: Record<OpenPoseKeypoint, [number, number]>;
  } | null>(null);

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

  const handleDragStart = (keypoint: OpenPoseKeypoint) => {
    const descendants = getDescendants(keypoint, HIERARCHY);
    const initialPositions: Record<string, [number, number]> = {};

    [keypoint, ...descendants].forEach((k) => {
      const pos = poseData?.[k];
      if (pos) {
        initialPositions[k] = [...pos];
      }
    });

    setDraggedJoint({ keypoint, descendants, initialPositions });
  };

  const handleDragMove = (
    keypoint: OpenPoseKeypoint,
    e: KonvaEventObject<DragEvent>
  ) => {
    if (!draggedJoint || draggedJoint.keypoint !== keypoint) return;

    const currentSkeleton = skeletons[selectedFrame];
    const { initialPositions, descendants } = draggedJoint;
    const initialParentPos = initialPositions[keypoint];
    const currentParentPos = [e.target.x(), e.target.y()] as [number, number];

    const dx = currentParentPos[0] - initialParentPos[0];
    const dy = currentParentPos[1] - initialParentPos[1];

    const updates: {
      keypoint: OpenPoseKeypoint;
      position: [number, number];
    }[] = [];

    updates.push({ keypoint, position: currentParentPos });

    descendants.forEach((descendant) => {
      const initialDescendantPos = initialPositions[descendant];
      if (initialDescendantPos && currentSkeleton[descendant]) {
        updates.push({
          keypoint: descendant,
          position: [
            initialDescendantPos[0] + dx,
            initialDescendantPos[1] + dy,
          ],
        });
      }
    });

    if (updates.length > 0) {
      setMultipleJointPositions(selectedFrame, updates);
    }
  };

  const handleDragEnd = () => {
    setDraggedJoint(null);
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
                  onDragStart={() => handleDragStart(keypoint)}
                  onDragMove={(e) => handleDragMove(keypoint, e)}
                  onDragEnd={handleDragEnd}
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
