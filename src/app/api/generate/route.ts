import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

export const MAX_INPUT_LENGTH = 100000; // Limit barha di
export const MAX_PROMPT_LENGTH = 100000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { text, model, voice, speed } = await req.json();
    const chunks = text.match(/[\s\S]{1,4000}/g) || [];
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const response = await openai.audio.speech.create({
        model: model || 'tts-1',
        voice: voice || 'alloy',
        input: chunk,
        speed: Number(speed) || 1.0,
      });
      audioBuffers.push(Buffer.from(await response.arrayBuffer()));
    }

    return new Response(Buffer.concat(audioBuffers), {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
