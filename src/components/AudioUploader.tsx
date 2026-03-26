'use client';

import { useState, useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import clsx from 'clsx';

interface Props {
  onUpload: (file: File) => Promise<void>;
}

const ACCEPTED_TYPES = {
  'audio/mpeg': ['.mp3'],
  'audio/mp4': ['.mp4', '.m4a'],
  'audio/wav': ['.wav'],
  'audio/webm': ['.webm'],
  'audio/ogg': ['.ogg'],
  'audio/aac': ['.aac'],
  'video/webm': ['.webm'],
};

export default function AudioUploader({ onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const firstError = rejectedFiles[0].errors[0];
      setError(firstError?.message ?? 'Invalid file');
      return;
    }

    if (acceptedFiles.length === 0) return;

    const selected = acceptedFiles[0];
    if (selected.size > 26 * 1024 * 1024) {
      setError('File is too large. Maximum size is 25 MB.');
      return;
    }

    setFile(selected);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(URL.createObjectURL(selected));
  }, [audioUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    multiple: false,
  });

  async function handleSubmit() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : file
            ? 'border-green-400 bg-green-50'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          {file ? (
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          ) : (
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          )}

          {file ? (
            <div>
              <p className="font-medium text-green-800">{file.name}</p>
              <p className="text-sm text-green-600">{formatSize(file.size)} — click or drag to replace</p>
            </div>
          ) : isDragActive ? (
            <p className="font-medium text-blue-700">Drop the audio file here</p>
          ) : (
            <div>
              <p className="font-medium text-slate-700">Drag & drop audio file here</p>
              <p className="text-sm text-slate-500 mt-1">or click to browse</p>
              <p className="text-xs text-slate-400 mt-2">MP3, MP4, M4A, WAV, WebM, OGG, AAC — max 25 MB</p>
            </div>
          )}
        </div>
      </div>

      {audioUrl && file && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Preview</p>
          <audio controls className="w-full" src={audioUrl}>
            Your browser does not support audio playback.
          </audio>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <a href="javascript:history.back()" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back
        </a>
        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Transcribing...
            </>
          ) : (
            <>
              Transcribe & Analyze
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
