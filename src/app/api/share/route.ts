import { NextRequest } from "next/server";
import { VOICES } from "@/lib/library";

export const MAX_INPUT_LENGTH = 100000; // Unlimited characters support

export async function POST(req: NextRequest) {
  console.log("--- Audio Request Received ---");
  
  try {
    const formData = await req.formData();
    const input = formData.get("input")?.toString() || "";
    const voice = formData.get("voice")?.toString() || "alloy";
    const speed = formData.get("speed")?.toString() || "1.0";

    if (!process.env.OPENAI_API_KEY) {
      console.error("CRITICAL ERROR: OpenAI API Key is missing in Render Settings!");
      return new Response("API Key Missing", { status: 500 });
    }

    // Unlimited Logic: Text ko 4000 chars ke chunks mein todna
    const chunks = input.match(/[\s\S]{1,4000}/g) || [];
    const audioBuffers: Uint8Array[] = [];

    console.log(`Processing ${chunks.length} chunks...`);

    for (const chunk of chunks) {
      const apiResponse = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          input: chunk,
          voice: voice,
          speed: parseFloat(speed),
        }),
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error("OpenAI API Error:", errorText);
        return new Response(`OpenAI Error: ${errorText}`, { status: apiResponse.status });
      }

      const arrayBuffer = await apiResponse.arrayBuffer();
      audioBuffers.push(new Uint8Array(arrayBuffer));
    }

    // Saare audio chunks ko combine karna
    const totalLength = audioBuffers.reduce((acc, curr) => acc + curr.length, 0);
    const combinedBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const buffer of audioBuffers) {
      combinedBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    console.log("Audio generated successfully!");
    return new Response(combinedBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });

  } catch (err: any) {
    console.error("Internal Server Error:", err.message);
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
      }
