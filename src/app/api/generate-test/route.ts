import { NextResponse } from "next/server";
import sharp from "sharp";
import { Skeleton, BONES } from "@/lib/pose-data";

async function generatePoseImage(
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

export async function POST(request: Request) {
  try {
    const { poseData, outputSize } = await request.json();

    if (!poseData || !outputSize) {
      return new NextResponse("Missing pose data or output size", {
        status: 400,
      });
    }

    const [width, height] = outputSize.split("x").map(Number);

    const imageBuffer = await generatePoseImage(poseData, width, height);
    const imageBase64 = `data:image/png;base64,${imageBuffer.toString(
      "base64"
    )}`;

    return NextResponse.json([imageBase64]);
  } catch (error) {
    console.error("[GENERATE_TEST_ROUTE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
