import { NextRequest, NextResponse } from "next/server";
import { OpenPoseSkeleton } from "@/lib/pose-data";

interface GenerateSequenceRequest {
  skeletons: OpenPoseSkeleton[];
  outputSize: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSequenceRequest = await request.json();
    const { skeletons, outputSize } = body;

    if (!skeletons || skeletons.length === 0) {
      return NextResponse.json(
        { error: "No skeletons provided" },
        { status: 400 }
      );
    }

    // Generate images for each frame in the sequence
    const generatedImages: string[] = [];
    const poseImages: string[] = [];

    for (let i = 0; i < skeletons.length; i++) {
      const skeleton = skeletons[i];

      // Call the existing generate-test-frame endpoint for each frame
      const response = await fetch(
        `${request.nextUrl.origin}/api/generate-test-frame`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            poseData: skeleton,
            outputSize,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate frame ${i + 1}`);
      }

      const result = await response.json();
      generatedImages.push(result.generatedImage); // Add the generated image URL
      poseImages.push(result.poseImage); // Add the pose image URL
    }

    return NextResponse.json({
      success: true,
      images: generatedImages,
      poseImages: poseImages,
      frameCount: skeletons.length,
    });
  } catch (error) {
    console.error("Error generating sequence:", error);
    return NextResponse.json(
      { error: "Failed to generate sequence" },
      { status: 500 }
    );
  }
}
