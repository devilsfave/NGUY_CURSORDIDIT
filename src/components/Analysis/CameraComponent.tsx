import React, { useRef, useState, useEffect } from 'react';
import ButtonStyling from '../ButtonStyling';

interface CameraComponentProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreamReady(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Unable to access camera. Please check your permissions and try again.');
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageSrc = canvasRef.current.toDataURL('image/jpeg');
        onCapture(imageSrc);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#171B26] p-4 rounded-lg max-w-lg w-full">
        <h2 className="text-xl mb-4 text-[#EFEFED]">Take a Picture</h2>
        <div className="relative">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto mb-4 rounded"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="flex justify-between">
          <ButtonStyling text="Capture" onClick={captureImage} disabled={!isStreamReady} />
          <ButtonStyling text="Close" onClick={onClose} variant="secondary" />
        </div>
      </div>
    </div>
  );
};

export default CameraComponent;