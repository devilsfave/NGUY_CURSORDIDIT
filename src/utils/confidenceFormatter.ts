export const formatConfidence = (confidence: number | string): number => {
  const numericConfidence = Number(confidence);
  
  if (isNaN(numericConfidence)) {
      return 0;
  }
  
  // If confidence is already in decimal form (0-1)
  if (numericConfidence <= 1) {
      return Math.round(numericConfidence * 100);
  }
  
  // If confidence is already in percentage form (0-100)
  if (numericConfidence <= 100) {
      return Math.round(numericConfidence);
  }
  
  // Default case: cap at 100
  return 100;
};