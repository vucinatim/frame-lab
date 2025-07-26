import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const animationsDir = path.join(process.cwd(), "src/lib/animations");
    const files = fs.readdirSync(animationsDir);

    const animations = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const filePath = path.join(animationsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const animationData = JSON.parse(fileContent);

        return {
          id: path.basename(file, ".json"),
          filename: file,
          ...animationData,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ animations });
  } catch (error) {
    console.error("Error loading animations:", error);
    return NextResponse.json(
      { error: "Failed to load animations" },
      { status: 500 }
    );
  }
}
