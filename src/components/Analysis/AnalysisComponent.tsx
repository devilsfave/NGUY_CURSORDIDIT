import React, { useState } from 'react';
import ButtonStyling from '../ButtonStyling';
import CameraComponent from './CameraComponent';
import { predictImage } from '../../utils/predictionApi';

interface AnalysisComponentProps {
  onAnalysisComplete: (result: any, imageUrl: string) => void;
}

const AnalysisComponent: React.FC<AnalysisComponentProps> = ({ onAnalysisComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleCameraCapture = (imageSrc: string) => {
    setImagePreview(imageSrc);
    setShowCamera(false);
    // Convert base64 to file
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setError(null);
      });
  };

  const handleAnalysis = async () => {
    if (!selectedFile || !imagePreview) {
      setError("Please select or capture an image first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await predictImage(selectedFile);
      onAnalysisComplete(result, imagePreview);
    } catch (error) {
      console.error('Error during analysis:', error);
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-[#0D111D] p-4 rounded-lg">
      <h2 className="text-2xl mb-4 text-[#EFEFED]">Upload Image for Analysis</h2>
      <div className="flex space-x-4 mb-4">
        <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <ButtonStyling
          text="Capture Image"
          onClick={() => setShowCamera(true)}
        />
      </div>
      {imagePreview && (
        <div className="mb-4">
          <img src={imagePreview} alt="Preview" className="max-w-full h-auto rounded" />
        </div>
      )}
      <ButtonStyling
        text={isAnalyzing ? "Analyzing..." : "Analyze Image"}
        onClick={handleAnalysis}
        disabled={!selectedFile || isAnalyzing}
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {showCamera && (
        <CameraComponent
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default AnalysisComponent;