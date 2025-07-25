import { NextResponse } from "next/server";
import Replicate, { WebhookEventType } from "replicate";
import { generatePoseImage } from "@/lib/generate-pose-image";
import workflow from "@/lib/comfy/character-animation.json";
import JSZip from "jszip";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const WEBHOOK_HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NGROK_HOST;

export async function POST(request: Request) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return new NextResponse(
        "The REPLICATE_API_TOKEN environment variable is not set.",
        { status: 500 }
      );
    }

    const { skeletons, outputSize, characterPrompt, characterImage } =
      await request.json();

    if (
      !skeletons ||
      skeletons.length === 0 ||
      !outputSize ||
      !characterImage
    ) {
      return new NextResponse(
        "Missing skeletons, output size, or character image",
        { status: 400 }
      );
    }

    const [width, height] = outputSize.split("x").map(Number);
    const characterImageBase64 = characterImage.split(",")[1];
    const characterImageBuffer = Buffer.from(characterImageBase64, "base64");

    const comfyWorkflow = JSON.parse(JSON.stringify(workflow));
    const positivePromptNode = comfyWorkflow["6"];
    if (positivePromptNode) {
      positivePromptNode.inputs.text =
        `${characterPrompt}, ` + positivePromptNode.inputs.text;
    }
    const workflow_json = JSON.stringify(comfyWorkflow);

    const generatedImages: string[] = [];
    const poseImages: string[] = [];
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (const skeleton of skeletons) {
      const poseImageBuffer = await generatePoseImage(skeleton, width, height);
      poseImages.push(
        `data:image/png;base64,${poseImageBuffer.toString("base64")}`
      );

      const zip = new JSZip();
      zip.file("pose.png", poseImageBuffer, { binary: true });
      zip.file("character.png", characterImageBuffer, { binary: true });
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

      const input = {
        workflow_json,
        input_file: `data:application/zip;base64,${zipBuffer.toString(
          "base64"
        )}`,
      };

      const options: {
        version: string;
        input: {
          workflow_json: string;
          input_file: string;
        };
      } = {
        version:
          "f552cf6bb263b2c7c547c3c7fb158aa4309794934bedc16c9aa395bee407744d",
        input,
      };

      let prediction = await replicate.predictions.create(options);

      while (
        prediction.status !== "succeeded" &&
        prediction.status !== "failed"
      ) {
        await sleep(1000);
        prediction = await replicate.predictions.get(prediction.id);
      }

      if (prediction.status === "succeeded" && prediction.output?.[0]?.url) {
        generatedImages.push(prediction.output[0].url);
      } else {
        console.error("Frame generation failed:", prediction);
      }
    }

    return NextResponse.json({
      success: true,
      images: generatedImages,
      poseImages: poseImages,
      frameCount: skeletons.length,
    });
  } catch (error) {
    console.error("[GENERATE_CHARACTER_SEQUENCE_ROUTE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
