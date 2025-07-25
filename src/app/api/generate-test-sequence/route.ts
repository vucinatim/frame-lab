import { NextRequest, NextResponse } from "next/server";
import { Skeleton } from "@/lib/pose-data";

interface GenerateSequenceRequest {
  skeletons: Skeleton[];
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

    for (let i = 0; i < skeletons.length; i++) {
      const skeleton = skeletons[i];

      // Call the existing generate-test endpoint for each frame
      const response = await fetch(
        `${request.nextUrl.origin}/api/generate-test`,
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
      generatedImages.push(result[0]); // Add the generated image URL
    }

    return NextResponse.json({
      success: true,
      images: generatedImages,
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
