"use client";
import { useState } from 'react';

export default function VoiceTool() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  const generateAudio = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ text, model: 'tts-1', voice: 'alloy' }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (e) {
      alert("Error generating audio");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Unlimited Voice Generator</h1>
      <textarea 
        rows={10} 
        style={{ width: '100%', color: 'black' }} 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        placeholder="Apna text yahan likhein..."
      />
      <p>Characters: {text.length}</p>
      <button onClick={generateAudio} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Voice'}
      </button>
      
      {audioUrl && (
        <div style={{ marginTop: '20px' }}>
          <audio src={audioUrl} controls />
          <br />
          <a href={audioUrl} download="voice.mp3">
            <button style={{ marginTop: '10px', background: 'green', color: 'white' }}>
              Download MP3
            </button>
          </a>
        </div>
      )}
    </div>
  );
        }
