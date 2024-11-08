export type Condition = 
  | 'melanoma'
  | 'basal cell carcinoma'
  | 'squamous cell carcinoma'
  | 'actinic keratosis'
  | 'benign'
  | 'normal'
  | string;

export interface AnalysisResult {
  userId: string;
  imageUrl: string;
  prediction: Condition;
  confidence: number;
  timestamp: Date;
  severity?: string;
  analysisResult?: string;
}