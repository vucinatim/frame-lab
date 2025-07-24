import { NextResponse } from "next/server";
import Replicate from "replicate";
import sharp from "sharp";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const PIXEL_ART_MODEL =
  "fofr/latent-consistency-model:553ae8a06185150e7550d21697520c4a4805374826b010691763406df74945d3";
const BG_REMOVAL_MODEL =
  "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { characterImage, poseData, outputSize } = body;

    if (!characterImage || !poseData || !outputSize) {
      return new NextResponse(
        "Missing character image, pose data, or output size",
        {
          status: 400,
        }
      );
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return new NextResponse("Missing Replicate API token", { status: 500 });
    }

    const [width, height] = outputSize.split("x").map(Number);
    const frameBuffers: Buffer[] = [];

    for (const pose of poseData) {
      // 1. Generate frame
      const generationOutput = (await replicate.run(PIXEL_ART_MODEL, {
        input: {
          prompt:
            "a full body character portrait, pixel art, 8-bit, on a solid green background",
          image: characterImage,
          control_image: pose.image,
          controlnet_conditioning_scale: 0.8,
          width,
          height,
        },
      })) as unknown as string[];

      // 2. Remove background
      const bgRemovalOutput = (await replicate.run(BG_REMOVAL_MODEL, {
        input: {
          image: generationOutput[0],
        },
      })) as unknown as string;

      // 3. Fetch image buffer
      const frameBuffer = await fetchImageBuffer(bgRemovalOutput);
      frameBuffers.push(frameBuffer);
    }

    // 4. Stitch frames
    const frameImages = frameBuffers.map((buffer) => sharp(buffer));
    const metadata = await Promise.all(
      frameImages.map((img) => img.metadata())
    );

    const totalWidth = metadata.reduce(
      (sum, meta) => sum + (meta.width || 0),
      0
    );
    const maxHeight = Math.max(...metadata.map((meta) => meta.height || 0));

    const spriteSheet = sharp({
      create: {
        width: totalWidth,
        height: maxHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    });

    let left = 0;
    const compositeOperations = [];
    for (const buffer of frameBuffers) {
      compositeOperations.push({ input: buffer, left: left, top: 0 });
      const meta = await sharp(buffer).metadata();
      left += meta.width || 0;
    }

    spriteSheet.composite(compositeOperations);

    const spriteSheetBuffer = await spriteSheet.png().toBuffer();
    const spriteSheetBase64 = `data:image/png;base64,${spriteSheetBuffer.toString(
      "base64"
    )}`;

    return NextResponse.json([spriteSheetBase64]);
  } catch (error) {
    console.error("[GENERATE_ROUTE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
