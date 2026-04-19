import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, Check, RotateCcw, Loader } from 'lucide-react';
import Webcam from 'react-webcam';

export default function CameraCapture({ onCapture, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, []);

  const retake = () => {
    setCapturedImage(null);
  };

  const confirm = async () => {
    if (!capturedImage) return;
    setUploading(true);
    try {
      await onCapture(capturedImage);
    } finally {
      setUploading(false);
      setCapturedImage(null);
      setIsOpen(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setCapturedImage(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-donkeyBrown text-white rounded-lg hover:bg-darkBrown transition-colors disabled:opacity-50"
      >
        <Camera className="w-4 h-4" />
        <span>Camera</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg overflow-hidden max-w-lg w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium text-gray-800">Camera Capture</h3>
          <button onClick={close} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="relative aspect-video bg-gray-900">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
          ) : (
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
            />
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 p-4">
          {capturedImage ? (
            <>
              <button
                onClick={retake}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={confirm}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Check className="w-4 h-4" />
                Use Photo
              </button>
            </>
          ) : (
            <button
              onClick={capture}
              className="w-14 h-14 bg-white border-4 border-donkeyBrown rounded-full hover:scale-105 transition-transform"
            />
          )}
        </div>
      </div>
    </div>
  );
}
