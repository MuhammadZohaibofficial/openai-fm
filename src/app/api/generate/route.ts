import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { text, model, voice, speed } = await req.json();

  // 1. Text ko 4000 characters ke chunks mein todna
  const chunks = text.match(/[\s\S]{1,4000}/g) || [];
  const audioBuffers = [];

  try {
    for (const chunk of chunks) {
      const response = await openai.audio.speech.create({
        model: model || 'tts-1',
        voice: voice || 'alloy',
        input: chunk,
        speed: speed || 1.0,
      });
      
      const buffer = Buffer.from(await response.arrayBuffer());
      audioBuffers.push(buffer);
    }

    // 2. Saare audio chunks ko ek saath jodna
    const combinedBuffer = Buffer.concat(audioBuffers);

    return new Response(combinedBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="voice.mp3"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
