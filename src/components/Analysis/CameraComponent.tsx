import React, { useRef, useState, useEffect } from 'react';
import ButtonStyling from '../ButtonStyling';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiCamera, FiX } from 'react-icons/fi';
import { handleError } from '../../utils/errorHandler';

interface CameraComponentProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        // First try the environment camera (rear)
        let mediaStream = null;
        
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 }, // Reduced from 1920
              height: { ideal: 720 }, // Reduced from 1080
            }
          });
        } catch (envError) {
          // If environment camera fails, try any available camera
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          });
        }

        if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setIsStreamReady(true);
          toast.success('Camera accessed successfully');
        }
      } catch (err) {
        await handleError(err, 'startCamera', {
          context: 'camera initialization',
          severity: 'error'
        });
        setError('Camera access denied or not available');
        toast.error('Please check camera permissions in your browser settings');
        
        // Show fallback message
        setError(`
          Unable to access camera. Please ensure:
          1. Camera permissions are enabled
          2. You're using a secure (HTTPS) connection
          3. Your device has a working camera
          
          You can also use the "Upload Image" option instead.
        `);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          setStream(null);
        });
      }
    };
  }, []);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size to match video feed
      const { videoWidth, videoHeight } = video;
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Draw current frame
      context.drawImage(video, 0, 0, videoWidth, videoHeight);

      // Convert to JPEG with reduced quality for better performance
      const imageSrc = canvas.toDataURL('image/jpeg', 0.85);
      
      // Stop the stream immediately after capture
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      onCapture(imageSrc);
    } catch (err) {
      console.error('Error capturing image:', err);
      toast.error('Failed to capture image. Please try again or use upload option.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-[#171B26] p-6 rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#EFEFED]">Camera</h2>
          <button
            onClick={onClose}
            className="text-[#9C9FA4] hover:text-[#EFEFED] transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 text-red-500 rounded-lg whitespace-pre-line">
              {error}
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            onLoadedMetadata={() => setIsStreamReady(true)}
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-4 justify-center">
          <ButtonStyling
            text="Capture"
            onClick={captureImage}
            disabled={!isStreamReady}
            icon={<FiCamera className="mr-2" />}
            className="w-32"
          />
          <ButtonStyling
            text="Cancel"
            onClick={onClose}
            variant="secondary"
            className="w-32"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CameraComponent;