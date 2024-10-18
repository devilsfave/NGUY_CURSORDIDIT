export interface CustomImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  }
  
  export interface PredictionResult {
    prediction: string;
  }