import { useState, useRef, useEffect } from 'react';

interface Props {
  value?: string; // base64 data URL
  onChange: (dataUrl: string | undefined) => void;
}

export default function VoiceMemoButton({ value, onChange }: Props) {
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      // Microphone permission denied or not available
      alert('Microphone access is needed for voice memos.');
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  function playAudio() {
    if (!value) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(value);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.play();
    setPlaying(true);
  }

  function pauseAudio() {
    audioRef.current?.pause();
    setPlaying(false);
  }

  function deleteRecording() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(false);
    setDuration(0);
    onChange(undefined);
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // Recording state
  if (recording) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <button
          onClick={stopRecording}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white transition-all hover:bg-red-600 active:scale-95"
        >
          <div className="h-3.5 w-3.5 rounded-sm bg-white" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-700">Recording</p>
          <p className="text-xs text-red-500">{formatTime(duration)}</p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-red-400"
              style={{
                height: `${12 + Math.random() * 12}px`,
                animation: `pulse 0.${4 + i}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Has a recording
  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-warm-border bg-sand/40 px-4 py-3">
        <button
          onClick={playing ? pauseAudio : playAudio}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bark text-white transition-all hover:bg-bark/90 active:scale-95"
        >
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink">Voice Memo</p>
          <p className="text-xs text-muted-ink">{formatTime(duration)}</p>
        </div>
        <button
          onClick={deleteRecording}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-ink transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>
    );
  }

  // No recording — show record button
  return (
    <button
      onClick={startRecording}
      className="flex w-full items-center gap-3 rounded-xl border border-dashed border-warm-border bg-sand/30 px-4 py-3 text-left transition-all hover:border-bark/30 hover:bg-sand/50 active:scale-[0.99]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
          <path d="M19 10v2a7 7 0 01-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">Record a voice memo</span>
        <span className="block text-xs text-muted-ink">Tap to start recording</span>
      </span>
    </button>
  );
}
