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

    const {
      poseData,
      outputSize,
      characterPrompt,
      characterImage, // This is a data URL
    } = await request.json();

    if (!poseData || !outputSize || !characterImage) {
      return new NextResponse(
        "Missing pose data, output size, or character image",
        { status: 400 }
      );
    }

    // 1. Generate the pose image from skeleton data
    const [width, height] = outputSize.split("x").map(Number);
    const poseImageBuffer = await generatePoseImage(poseData, width, height);

    // 2. Prepare the ComfyUI workflow
    const comfyWorkflow = JSON.parse(JSON.stringify(workflow));

    // Inject the user's prompt into the positive prompt node
    const positivePromptNode = comfyWorkflow["6"];
    if (positivePromptNode) {
      positivePromptNode.inputs.text =
        `${characterPrompt}, ` + positivePromptNode.inputs.text;
    }

    // 3. Create a zip file with the input images
    const zip = new JSZip();
    zip.file("pose.png", poseImageBuffer, { binary: true });
    // Convert character image data URL to buffer
    const characterImageBase64 = characterImage.split(",")[1];
    const characterImageBuffer = Buffer.from(characterImageBase64, "base64");
    zip.file("character.png", characterImageBuffer, { binary: true });

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // 4. Create the prediction with the workflow and zipped inputs
    const input = {
      workflow_json: JSON.stringify(comfyWorkflow),
      input_file: `data:application/zip;base64,${zipBuffer.toString("base64")}`,
    };

    const options: {
      version: string;
      input: { workflow_json: string; input_file: string };
      webhook?: string;
      webhook_events_filter?: WebhookEventType[];
    } = {
      version:
        "f552cf6bb263b2c7c547c3c7fb158aa4309794934bedc16c9aa395bee407744d",
      input,
    };

    if (WEBHOOK_HOST) {
      options.webhook = `${WEBHOOK_HOST}/api/webhooks`;
      options.webhook_events_filter = ["start", "completed"];
    }

    const prediction = await replicate.predictions.create(options);

    if (prediction?.error) {
      return NextResponse.json({ detail: prediction.error }, { status: 500 });
    }

    const poseImageDataUrl = `data:image/png;base64,${poseImageBuffer.toString(
      "base64"
    )}`;

    // Return a modified prediction object that includes our pose image for the UI
    return NextResponse.json(
      { ...prediction, poseImage: poseImageDataUrl },
      { status: 201 }
    );
  } catch (error) {
    console.error("[GENERATE_CHARACTER_FRAME_ROUTE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
