import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Design ko chalane ke liye ye constants zaruri hain
export const MAX_INPUT_LENGTH = 100000; 
export const MAX_PROMPT_LENGTH = 100000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { text, model, voice, speed } = await req.json();

    if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });

    // Text ko 4000 characters ke tukdon mein todna (Unlimited logic)
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
        'Content-Disposition': 'attachment; filename="audio.mp3"'
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
        }
