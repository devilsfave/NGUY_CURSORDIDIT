import { PredictionResult } from '../types/ml';

export const predictImage = async (imageFile: File): Promise<PredictionResult> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('description', 'image');

    const response = await fetch('/api/predict', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    if (typeof result.prediction !== 'string') {
      throw new Error(`Invalid prediction format: ${JSON.stringify(result)}`);
    }

    return result.prediction as PredictionResult;
  } catch (error) {
    console.error('Error predicting image:', error);
    if (error instanceof Error) {
      throw new Error(`Prediction failed: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred during prediction');
    }
  }
};