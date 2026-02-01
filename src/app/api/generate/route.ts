import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Ye values export karna zaruri hain share feature ke liye
export const MAX_INPUT_LENGTH = 50000;
export const MAX_PROMPT_LENGTH = 50000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, model, voice, speed } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Text ko chunks mein todna
    const chunks = text.match(/[\s\S]{1,4000}/g) || [];
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const response = await openai.audio.speech.create({
        model: model || 'tts-1',
        voice: voice || 'alloy',
        input: chunk,
        speed: Number(speed) || 1.0,
      });
      
      const buffer = Buffer.from(await response.arrayBuffer());
      audioBuffers.push(buffer);
    }

    const combinedBuffer = Buffer.concat(audioBuffers);

    return new Response(combinedBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="voice.mp3"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}
