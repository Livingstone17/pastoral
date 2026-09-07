import { useState, useRef, useEffect, useCallback } from 'react';
import { saveVoiceMemo, loadVoiceMemo, deleteVoiceMemo, memoKey } from '../services/voiceMemoStore';

interface Props {
  /** Memo key (e.g. "memo-m1") — NOT a base64 data URL. */
  value?: string;
  onChange: (key: string | undefined) => void;
  /** The message ID, used to generate the storage key. */
  messageId: string;
}

export default function VoiceMemoButton({ value, onChange, messageId }: Props) {
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasMemo, setHasMemo] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check if a memo exists in IndexedDB
  useEffect(() => {
    if (value) {
      loadVoiceMemo(value).then((blob) => setHasMemo(!!blob));
    } else {
      setHasMemo(false);
    }
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        // Prefer a compact audio format to reduce storage
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        const key = memoKey(messageId);
        try {
          await saveVoiceMemo(key, blob);
          onChange(key);
          setHasMemo(true);
        } catch {
          if (import.meta.env.DEV) {
            console.error('Failed to save voice memo to IndexedDB');
          }
        }
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      alert('Microphone access is needed for voice memos.');
    }
  }

  async function playAudio() {
    if (!value) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const blob = await loadVoiceMemo(value);
    if (!blob) return;
    // Revoke any previous object URL
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.play();
    setPlaying(true);
  }

  function pauseAudio() {
    audioRef.current?.pause();
    setPlaying(false);
  }

  async function deleteRecording() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (value) {
      await deleteVoiceMemo(value).catch(() => {});
    }
    setPlaying(false);
    setDuration(0);
    setHasMemo(false);
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
  if (value && hasMemo) {
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
