import { Skeleton, BONES } from "./pose-data";
import sharp from "sharp";

/**
 * Generates a pose image from skeleton data by creating an SVG with bones and joints,
 * then converting it to a PNG buffer. The skeleton is centered within the specified dimensions.
 * @param skeleton - The skeleton data containing joint positions
 * @param width - The width of the output image
 * @param height - The height of the output image
 * @returns A Buffer containing the PNG image data
 */
export async function generatePoseImage(
  skeleton: Skeleton,
  width: number,
  height: number
): Promise<Buffer> {
  // Calculate bounding box of the skeleton
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  skeleton.forEach((joint) => {
    if (joint.x < minX) minX = joint.x;
    if (joint.y < minY) minY = joint.y;
    if (joint.x > maxX) maxX = joint.x;
    if (joint.y > maxY) maxY = joint.y;
  });

  const skeletonWidth = maxX - minX;
  const skeletonHeight = maxY - minY;
  const skeletonCenterX = minX + skeletonWidth / 2;
  const skeletonCenterY = minY + skeletonHeight / 2;

  const canvasCenterX = width / 2;
  const canvasCenterY = height / 2;

  const dx = canvasCenterX - skeletonCenterX;
  const dy = canvasCenterY - skeletonCenterY;

  // Apply the translation to a new, centered skeleton
  const centeredSkeleton = skeleton.map((joint) => ({
    ...joint,
    x: joint.x + dx,
    y: joint.y + dy,
  }));

  const svgElements: string[] = [];
  const jointsById = Object.fromEntries(centeredSkeleton.map((j) => [j.id, j]));

  // Draw bones
  BONES.forEach(([j1Id, j2Id]) => {
    const j1 = jointsById[j1Id];
    const j2 = jointsById[j2Id];
    if (j1 && j2) {
      svgElements.push(
        `<line x1="${j1.x}" y1="${j1.y}" x2="${j2.x}" y2="${j2.y}" stroke="white" stroke-width="4" />`
      );
    }
  });

  // Draw joints
  centeredSkeleton.forEach((joint) => {
    svgElements.push(
      `<circle cx="${joint.x}" cy="${joint.y}" r="8" fill="red" />`
    );
  });

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="black" />
      ${svgElements.join("")}
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
