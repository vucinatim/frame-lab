import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// In production and preview deployments (on Vercel), the VERCEL_URL environment variable is set.
// In development (on your local machine), the NGROK_HOST environment variable is set.
const WEBHOOK_HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NGROK_HOST;

export async function POST(request: Request) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return new NextResponse(
        "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it.",
        { status: 500 }
      );
    }

    const { prompt } = await request.json();

    if (!prompt || !prompt.trim()) {
      return new NextResponse("Prompt is required for character generation", {
        status: 400,
      });
    }

    // Create a standardized T-pose prompt optimized for character animation
    const tPosePrompt = `${prompt.trim()}, full body, standing straight in a relaxed pose, arms down, front view, centered composition, clean background, high quality character design, detailed`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
      model: "black-forest-labs/flux-schnell",
      input: {
        prompt: tPosePrompt,
        width: 768,
        height: 768,
        num_inference_steps: 4,
        guidance_scale: 7.5,
      },
    };

    if (WEBHOOK_HOST) {
      options.webhook = `${WEBHOOK_HOST}/api/webhooks`;
      options.webhook_events_filter = ["start", "completed"];
    }

    // A prediction is the result you get when you run a model, including the input, output, and other details
    const prediction = await replicate.predictions.create(options);

    if (prediction?.error) {
      return NextResponse.json({ detail: prediction.error }, { status: 500 });
    }

    return NextResponse.json(prediction, { status: 201 });
  } catch (error) {
    console.error("[GENERATE_CHARACTER_ROUTE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
