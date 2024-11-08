// Export the types
export type Condition = 'nv' | 'mel' | 'bkl' | 'bcc' | 'akiec' | 'vasc' | 'df' | 'normal';

export interface ConditionInfo {
  name: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low' | 'Normal';
  recommendations: string[];
  link?: string;
}

const conditionDetails: Record<Condition, ConditionInfo> = {
  'mel': {
    name: 'Melanoma',
    description: 'A serious form of skin cancer that develops from melanocytes.',
    severity: 'High',
    recommendations: [
      'Perform regular skin checks.',
      'Wear sunscreen and protective clothing.',
      'Consult a dermatologist regularly.',
      'Seek immediate medical attention'
    ],
    link: 'https://www.cancer.org/cancer/melanoma-skin-cancer.html'
  },
  'bcc': {
    name: 'Basal Cell Carcinoma',
    description: 'The most common type of skin cancer.',
    severity: 'Medium',
    recommendations: [
      'Avoid sun exposure and use sunscreen.',
      'See a dermatologist for any suspicious growths.'
    ],
    link: 'https://www.aad.org/public/diseases/skin-cancer/types/basal-cell-carcinoma'
  },
  'akiec': {
    name: 'Actinic Keratosis',
    description: 'A pre-cancerous skin condition caused by sun exposure.',
    severity: 'Medium',
    recommendations: [
      'Use sunscreen and protective clothing.',
      'See a dermatologist for treatment options.'
    ],
    link: 'https://www.aad.org/public/diseases/skin-cancer/types/actinic-keratosis'
  },
  'bkl': {
    name: 'Benign Keratosis',
    description: 'A non-cancerous growth that can appear on the skin.',
    severity: 'Low',
    recommendations: [
      'Keep the area clean and dry.',
      'Consult a dermatologist if it becomes painful or changes.'
    ],
    link: 'https://www.aad.org/public/diseases/skin-conditions/benign-keratosis'
  },
  'nv': {
    name: 'Melanocytic Nevus',
    description: 'A common benign mole that usually requires no treatment.',
    severity: 'Low',
    recommendations: [
      'Monitor any changes in size, shape, or color.',
      'Consult a dermatologist if changes occur.'
    ],
    link: 'https://www.aad.org/public/diseases/skin-conditions/moles'
  },
  'vasc': {
    name: 'Vascular Lesion',
    description: 'Vascular lesions can appear in a variety of forms and are usually benign.',
    severity: 'Low',
    recommendations: [
      'Monitor any changes in the lesions.',
      'Consult a dermatologist if concerned.'
    ],
    link: 'https://www.ncbi.nlm.nih.gov/books/NBK547990/'
  },
  'df': {
    name: 'Dermatofibroma',
    description: 'A common benign skin growth that often appears on the legs.',
    severity: 'Low',
    recommendations: [
      'Monitor for any changes.',
      'Consult a dermatologist for removal options if desired.'
    ],
    link: 'https://www.aad.org/public/diseases/skin-conditions/dermatofibroma'
  },
  'normal': {
    name: 'Normal Skin',
    description: 'No concerning skin conditions detected.',
    severity: 'Normal',
    recommendations: [
      'Continue regular skin care routine',
      'Use sunscreen daily',
      'Perform regular self-examinations'
    ]
  }
};

const CONFIDENCE_THRESHOLDS = {
  VERY_HIGH: 85,
  HIGH: 75,
  MEDIUM: 65,
  LOW: 50
} as const;

export const calculateSeverity = (condition: Condition, confidence: number): string => {
  // Melanoma has lower thresholds due to its severity
  if (condition === 'mel') {
    if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'High';
    if (confidence >= CONFIDENCE_THRESHOLDS.LOW) return 'Medium';
    return 'Low';
  }

  // Normal classification
  if (condition === 'normal') return 'Normal';

  // Other conditions
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'High';
  if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'Medium';
  return 'Low';
};

export const shouldClassifyAsNormal = (confidence: number): boolean => {
  return confidence < CONFIDENCE_THRESHOLDS.LOW;
};

// Add descriptions for each condition
export const getConditionInfo = (condition: Condition): ConditionInfo => {
  return conditionDetails[condition];
};
