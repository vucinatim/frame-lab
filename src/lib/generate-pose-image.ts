import {
  OpenPoseSkeleton,
  LIMB_CONNECTIONS,
  OpenPoseKeypoint,
} from "./pose-data";
import sharp from "sharp";

/**
 * Parses an RGB color string and increases its brightness.
 * @param colorStr - The RGB color string (e.g., "rgb(255, 100, 0)").
 * @param factor - The factor by which to increase brightness (e.g., 1.5).
 * @returns The new, brighter RGB color string.
 */
function brightenRgb(colorStr: string, factor: number): string {
  const rgb = colorStr.match(/\d+/g)?.map(Number);
  if (!rgb || rgb.length !== 3) return colorStr;

  const r = Math.min(255, Math.round(rgb[0] * factor));
  const g = Math.min(255, Math.round(rgb[1] * factor));
  const b = Math.min(255, Math.round(rgb[2] * factor));

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Generates a pose image from OpenPose skeleton data by creating an SVG with colored limbs and keypoints,
 * then converting it to a PNG buffer.
 * @param skeleton - The OpenPose skeleton data.
 * @param width - The width of the output image.
 * @param height - The height of the output image.
 * @returns A Buffer containing the PNG image data.
 */
export async function generatePoseImage(
  skeleton: OpenPoseSkeleton,
  width: number,
  height: number
): Promise<Buffer> {
  const svgElements: string[] = [];

  if (!skeleton || Object.keys(skeleton).length === 0) {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="black" />
      </svg>
    `;
    return sharp(Buffer.from(svg)).png().toBuffer();
  }

  // Calculate scale and offset to fit the skeleton in the canvas
  const coords = Object.values(skeleton).filter(Boolean) as [number, number][];
  if (coords.length === 0) {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="black" />
      </svg>
    `;
    return sharp(Buffer.from(svg)).png().toBuffer();
  }

  const minX = Math.min(...coords.map((c) => c[0]));
  const minY = Math.min(...coords.map((c) => c[1]));
  const maxX = Math.max(...coords.map((c) => c[0]));
  const maxY = Math.max(...coords.map((c) => c[1]));

  const skeletonWidth = maxX - minX;
  const skeletonHeight = maxY - minY;
  const padding = 20;

  const scale = Math.min(
    (width - padding) / skeletonWidth,
    (height - padding) / skeletonHeight
  );

  const offsetX = (width - skeletonWidth * scale) / 2 - minX * scale;
  const offsetY = (height - skeletonHeight * scale) / 2 - minY * scale;

  const transform = (p: [number, number]): [number, number] => {
    return [p[0] * scale + offsetX, p[1] * scale + offsetY];
  };

  // Draw limbs
  for (const limb of LIMB_CONNECTIONS) {
    const p1_name = limb.points[0];
    const p2_name = limb.points[1];
    const p1 = skeleton[p1_name];
    const p2 = skeleton[p2_name];
    if (p1 && p2) {
      const tp1 = transform(p1);
      const tp2 = transform(p2);
      svgElements.push(
        `<line x1="${tp1[0]}" y1="${tp1[1]}" x2="${tp2[0]}" y2="${tp2[1]}" stroke="${limb.color}" stroke-width="9" stroke-opacity="0.6" />`
      );
    }
  }

  // Create a map of joint colors based on their child limb, then brighten them
  const jointColors: Record<string, string> = {};
  for (const limb of [...LIMB_CONNECTIONS].reverse()) {
    // Child joint gets the limb color
    jointColors[limb.points[1]] = limb.color;
    // Parent joint gets the limb color if it doesn't have one
    if (!jointColors[limb.points[0]]) {
      jointColors[limb.points[0]] = limb.color;
    }
  }

  // Draw keypoints (joints)
  for (const keypoint of Object.keys(skeleton) as OpenPoseKeypoint[]) {
    const pos = skeleton[keypoint];
    if (pos) {
      const transformedPos = transform(pos);
      const color = jointColors[keypoint] || "white";
      const brightColor = brightenRgb(color, 1.5);
      svgElements.push(
        `<circle cx="${transformedPos[0]}" cy="${transformedPos[1]}" r="7" fill="${brightColor}" fill-opacity="0.8" />`
      );
    }
  }

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="black" />
      ${svgElements.join("")}
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
