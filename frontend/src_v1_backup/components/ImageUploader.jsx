import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export default function ImageUploader({ onUpload, disabled }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload
    handleUpload(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    disabled: uploading || disabled
  });

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      setPreview(null);
    }
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-donkeyBrown/20">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          <button
            onClick={clearPreview}
            disabled={uploading}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-donkeyBrown bg-ivory/50' 
              : 'border-gray-300 hover:border-donkeyBrown/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <ImageIcon className="w-8 h-8 mx-auto text-donkeyBrown/60 mb-2" />
          <p className="text-sm text-gray-600">
            {isDragActive ? 'Drop image here...' : 'Drag & drop image, or click to select'}
          </p>
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF up to 10MB</p>
        </div>
      )}
    </div>
  );
}
