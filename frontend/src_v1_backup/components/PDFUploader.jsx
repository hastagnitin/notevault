import React, { useState, useRef } from 'react';
import { FileText, Upload, X, Loader, CheckCircle } from 'lucide-react';

export default function PDFUploader({ onUpload, disabled }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 300);

    try {
      await onUpload(file);
      setProgress(100);
    } catch (err) {
      console.error('PDF upload failed:', err);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setUploading(false);
        setFile(null);
        setProgress(0);
        if (inputRef.current) inputRef.current.value = '';
      }, 1000);
    }
  };

  const clearFile = () => {
    setFile(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-gray-300 hover:border-donkeyBrown/50 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FileText className="w-8 h-8 mx-auto text-donkeyBrown/60 mb-2" />
          <p className="text-sm text-gray-600">Click to select a PDF file</p>
          <p className="text-xs text-gray-400 mt-1">PDF up to 10MB</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--accent-cyan)]" />
              <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                {file.name}
              </span>
              <span className="text-xs text-gray-400">
                ({(file.size / 1024 / 1024).toFixed(1)} MB)
              </span>
            </div>
            {!uploading && progress < 100 && (
              <button onClick={clearFile} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>

          {uploading || progress === 100 ? (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress === 100 ? 'bg-green-500' : 'bg-donkeyBrown'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {progress === 100 ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Complete!</span>
                  </>
                ) : (
                  <>
                    <Loader className="w-3 h-3 animate-spin" />
                    <span>Processing... {progress}%</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={handleUpload}
              disabled={disabled}
              className="w-full py-2 bg-donkeyBrown text-white rounded-md text-sm font-medium hover:bg-darkBrown transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4 inline mr-1" />
              Upload & Extract
            </button>
          )}
        </div>
      )}
    </div>
  );
}
