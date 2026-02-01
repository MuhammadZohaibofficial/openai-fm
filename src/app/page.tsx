import ClientDynamicTTS from "@/components/ClientDynamicTTS";

export default function Page() {
  const audioUrl = "/my-voice.mp3";

  return (
    <>
      <ClientDynamicTTS />

      <a href={audioUrl} download="my-voice.mp3" className="download-btn">
        Download MP3
      </a>
    </>
  );
}
