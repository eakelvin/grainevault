"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_SECONDS = 60;

function pickRecorderMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function micErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      return "Allow microphone access to record.";
    }
    if (error.name === "NotFoundError") {
      return "No microphone was found.";
    }
  }
  return "Couldn't start recording. Please try again.";
}

interface VoiceRecorderProps {
  blob: Blob | null;
  onChange: (blob: Blob | null) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ blob, onChange, disabled }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!blob) {
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      return;
    }
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }
      recorderRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const finishRecording = (nextBlob: Blob) => {
    clearTimer();
    stopTracks();
    recorderRef.current = null;
    setRecording(false);
    setElapsed(0);
    onChange(nextBlob);
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const startRecording = async () => {
    if (disabled || recording) return;
    setError(null);
    onChange(null);

    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Voice recording isn't supported in this browser.");
      return;
    }

    const mimeType = pickRecorderMimeType();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        setError("Couldn't start recording. Please try again.");
        stopTracks();
        setRecording(false);
        clearTimer();
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || "audio/webm";
        finishRecording(new Blob(chunksRef.current, { type }));
      };

      recorder.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        setElapsed((seconds) => {
          if (seconds + 1 >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return seconds + 1;
        });
      }, 1000);
    } catch (startError) {
      stopTracks();
      setError(micErrorMessage(startError));
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-300">Voice note</p>
        <p className="text-xs tabular-nums text-slate-500">
          {recording ? formatTime(elapsed) : blob ? "Ready to send" : `Up to ${MAX_SECONDS}s`}
        </p>
      </div>

      {previewUrl && !recording && (
        <audio controls src={previewUrl} className="w-full" />
      )}

      <div className="flex flex-wrap gap-2">
        {recording ? (
          <Button
            type="button"
            variant="destructive"
            onClick={stopRecording}
            disabled={disabled}
            className="gap-2"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>
        ) : (
          <Button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="gap-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600"
          >
            {blob ? <RotateCcw className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {blob ? "Re-record" : "Start recording"}
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
