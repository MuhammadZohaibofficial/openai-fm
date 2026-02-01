import { NextRequest, userAgent } from "next/server";
import { VOICES } from "@/lib/library";

// Limit ko barha kar 50,000 characters kar diya
export const MAX_INPUT_LENGTH = 50000;
export const MAX_PROMPT_LENGTH = 1000;

export async function POST(req: NextRequest) {
  const ua = userAgent(req);
  const response_format = ua.engine?.name === "Blink" ? "wav" : "mp3";

  const formData = await req.formData();
  let input = formData.get("input")?.toString() || "";
  let prompt = formData.get("prompt")?.toString() || "";
  const voice = formData.get("voice")?.toString() || "";
  const vibe = formData.get("vibe") || "audio";

  if (!VOICES.includes(voice)) {
    return new Response("Invalid voice", { status: 400 });
  }

  // Text ko 4000 characters ke chunks mein todna
  const chunks = input.match(/[\s\S]{1,4000}/g) || [];
  const audioBuffers: Uint8Array[] = [];

  try {
    for (const chunk of chunks) {
      const apiResponse = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1", // tts-1 zyada stable hai long text ke liye
          input: chunk,
          response_format,
          voice,
          ...(prompt && { instructions: prompt }),
        }),
      });

      if (!apiResponse.ok) throw new Error("API Error");
      
      const arrayBuffer = await apiResponse.arrayBuffer();
      audioBuffers.push(new Uint8Array(arrayBuffer));
    }

    // Saare audio chunks ko ek file banana
    const totalLength = audioBuffers.reduce((acc, curr) => acc + curr.length, 0);
    const combinedBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const buffer of audioBuffers) {
      combinedBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    const filename = `openai-fm-${voice}-${vibe}.${response_format}`;

    return new Response(combinedBuffer, {
      headers: {
        "Content-Type": response_format === "wav" ? "audio/wav" : "audio/mpeg",
        "Content-Disposition": `attachment; filename="${filename}"`, // Isse download trigger hoga
      },
    });
  } catch (err) {
    return new Response("Error generating speech", { status: 500 });
  }
}

// GET handler (Same logic as POST)
export async function GET(req: NextRequest) {
    // Aap upar wala logic GET mein bhi copy kar sakte hain agar browser URL se generate karna ho.
    return new Response("Use POST for unlimited generation", { status: 400 });
}
