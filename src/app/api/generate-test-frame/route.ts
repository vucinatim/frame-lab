import { generatePoseImage } from "@/lib/generate-pose-image";
import { NextResponse } from "next/server";

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

    return NextResponse.json({
      poseImage: imageBase64,
      generatedImage: imageBase64, // For test frame, pose image is the same as generated
    });
  } catch (error) {
    console.error("[GENERATE_TEST_ROUTE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
