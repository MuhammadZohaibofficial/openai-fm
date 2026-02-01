import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  console.log("--- Voice Generation Started ---");
  
  try {
    const formData = await req.formData();
    const input = formData.get("input")?.toString() || "";
    const voice = formData.get("voice")?.toString() || "alloy";

    console.log("Input received:", input.substring(0, 50) + "...");
    console.log("Voice selected:", voice);

    if (!process.env.OPENAI_API_KEY) {
      console.error("ERROR: OPENAI_API_KEY is missing in Render settings!");
      return new Response("API Key Missing", { status: 500 });
    }

    // OpenAI API call
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as any,
      input: input,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    console.log("Audio generated successfully!");

    return new Response(buffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });

  } catch (err: any) {
    console.error("DETAILED ERROR:", err.message);
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
