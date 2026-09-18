"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, ImageIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SNAPSHOT_FILE_ACCEPT, isPdfFile } from "@/lib/idea-draft";
import { cn } from "@/lib/utils";

interface SnapshotPickerProps {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SnapshotPicker({ file, onChange, disabled }: SnapshotPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const pdfSelected = Boolean(file && isPdfFile(file));

  useEffect(() => {
    if (!file || isPdfFile(file)) {
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFile = (next: File | null) => {
    if (disabled) return;
    onChange(next);
  };

  const replaceSnapshot = () => {
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id="snapshot-file"
        type="file"
        accept={SNAPSHOT_FILE_ACCEPT}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
      />

      {file && pdfSelected ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-3">
            <FileText className="h-5 w-5 shrink-0 text-indigo-400" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-200">{file.name}</p>
              <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={replaceSnapshot}
            disabled={disabled}
            className="gap-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600"
          >
            <RotateCcw className="h-4 w-4" />
            Replace snapshot
          </Button>
        </div>
      ) : previewUrl ? (
        <div className="space-y-3">
          <img
            src={previewUrl}
            alt="Selected snapshot"
            className="max-h-56 w-full rounded-xl border border-slate-700/60 object-contain bg-slate-950/50"
          />
          <Button
            type="button"
            onClick={replaceSnapshot}
            disabled={disabled}
            className="gap-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600"
          >
            <RotateCcw className="h-4 w-4" />
            Replace snapshot
          </Button>
        </div>
      ) : (
        <label
          htmlFor="snapshot-file"
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            pickFile(event.dataTransfer.files[0] ?? null);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/60 bg-slate-800/40 px-4 py-10 text-center",
            dragging && "border-indigo-400 bg-indigo-500/10",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          <ImageIcon className="mb-3 h-8 w-8 text-slate-500" />
          <p className="text-sm font-medium text-slate-200">
            Drop a snapshot or click to upload
          </p>
          <p className="mt-1 text-xs text-slate-500">JPEG, PNG, WebP, or PDF</p>
        </label>
      )}
    </div>
  );
}
