import React, { useState, useRef } from 'react';
import ButtonStyling from '../ButtonStyling';
import CameraComponent from './CameraComponent';
import { predictImage } from '../../utils/predictionApi';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { saveToHistory } from '../../utils/saveToHistory';
import { User } from '../../contexts/AuthContext';
import type { Condition } from '../../utils/severityCalculator';
import { handleError } from '../../utils/errorHandler';
import { Analysis } from '../../types/analysis';
import { saveAnalysisResults } from '../../services/analysisService';
import { getConditionInfo, calculateSeverity } from '../../utils/severityCalculator';
import { Timestamp } from 'firebase/firestore';

interface PredictionResult {
  prediction: Condition;
  confidence: number;
}

interface AnalysisComponentProps {
  onAnalysisComplete: (result: PredictionResult, imageUrl: string) => void;
  user: User;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MIN_DIMENSIONS = { width: 224, height: 224 };

const validateImage = async (file: File): Promise<boolean> => {
  try {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Image must be less than 10MB');
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Only JPEG, PNG and WebP images are supported');
    }

    // Check dimensions
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width < MIN_DIMENSIONS.width || img.height < MIN_DIMENSIONS.height) {
          reject(new Error(`Image must be at least ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} pixels`));
        }
        resolve(true);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    });
  } catch (error) {
    await handleError(error, 'validateImage', {
      context: 'image validation',
      severity: 'warning',
      additionalInfo: `File size: ${file.size}, Type: ${file.type}`
    });
    throw error;
  }
};

const AnalysisComponent: React.FC<AnalysisComponentProps> = ({ onAnalysisComplete, user }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await validateImage(file);
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    } catch (error) {
      await handleError(error, 'handleFileChange', {
        context: 'file selection',
        severity: 'warning',
        additionalInfo: `File: ${file.name}`
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = async (imageSrc: string) => {
    try {
      const base64Response = await fetch(imageSrc);
      const blob = await base64Response.blob();
      
      const file = new File([blob], `camera_capture_${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      await validateImage(file);
      setSelectedFile(file);
      setImagePreview(imageSrc);
      setShowCamera(false);
      setError(null);
      toast.success('Photo captured successfully!');
    } catch (error) {
      await handleError(error, 'handleCameraCapture', {
        context: 'camera capture',
        severity: 'error',
        additionalInfo: 'Camera capture processing failed'
      });
    }
  };

  const handleAnalysis = async () => {
    if (!selectedFile || !imagePreview) {
      toast.error('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log('Starting analysis...');
      const result = await predictImage(selectedFile);
      console.log('Prediction result:', result);
      
      if (!result.prediction || result.prediction === 'normal') {
        console.warn('Received normal prediction:', result);
      }

      const conditionInfo = getConditionInfo(result.prediction);
      
      await saveAnalysisResults({
        userId: user.uid,
        imageUrl: imagePreview,
        result: result.prediction,
        prediction: result.prediction,
        confidence: result.confidence,
        severity: calculateSeverity(result.prediction, result.confidence),
        condition: conditionInfo.name,
        conditionName: conditionInfo.name,
        description: conditionInfo.description,
        date: Timestamp.fromDate(new Date()),
        type: 'analysis',
        attachedToAppointment: false,
        attachedAt: undefined,
        appointmentId: undefined
      }, user);

      onAnalysisComplete(result, imagePreview);
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during analysis');
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverity = (confidence: number): string => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  const getPredictionLabel = (prediction: string): string => {
    const labels: { [key: string]: string } = {
      'nv': 'Melanocytic Nevi',
      'mel': 'Melanoma',
      'bkl': 'Benign Keratosis',
      'bcc': 'Basal Cell Carcinoma',
      'akiec': 'Actinic Keratosis',
      'vasc': 'Vascular Lesion',
      'df': 'Dermatofibroma',
      'normal': 'Normal Skin'
    };
    return labels[prediction] || prediction;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#171B26] p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-[#EFEFED]">Upload Image for Analysis</h2>
      
      <div className="flex gap-4 mb-6">
        <ButtonStyling
          text="Upload Image"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
          variant="primary"
        />
        <ButtonStyling
          text="Take Photo"
          onClick={() => setShowCamera(true)}
          className="flex-1"
          variant="secondary"
        />
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {showCamera && (
          <CameraComponent
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        )}

        {imagePreview && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <div className="relative w-full h-64 bg-[#262A36] rounded-lg overflow-hidden">
              <Image
                src={imagePreview}
                alt="Selected skin image"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className="mt-4 flex gap-4">
              <ButtonStyling
                text={isAnalyzing ? "Analyzing..." : "Analyze Image"}
                onClick={handleAnalysis}
                disabled={!selectedFile || isAnalyzing}
                className="flex-1"
                variant="primary"
              />
              <ButtonStyling
                text="Reset"
                onClick={handleReset}
                variant="secondary"
                disabled={isAnalyzing}
              />
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnalysisComponent;
