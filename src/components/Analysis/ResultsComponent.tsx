import React from 'react';
import ButtonStyling from "../ButtonStyling";
import { firestore as db } from '../../Firebase/config';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const conditions = ['nv', 'mel', 'bkl', 'bcc', 'akiec', 'vasc', 'df'] as const;
type Condition = typeof conditions[number];

interface ConditionInfo {
  explanation: string;
  link: string;
  recommendations: string[];
}

const conditionExplanations: Record<Condition, ConditionInfo> = {
  'nv': {
    explanation: 'A common benign mole or nevus that usually requires no treatment.',
    link: 'https://www.aad.org/public/diseases/skin-conditions/moles',
    recommendations: [
      'Monitor any changes in size, shape, or color.',
      'Consult a dermatologist if changes occur.'
    ],
  },
  'mel': {
    explanation: 'Melanoma is a serious form of skin cancer that develops from melanocytes.',
    link: 'https://www.cancer.org/cancer/melanoma-skin-cancer.html',
    recommendations: [
      'Perform regular skin checks.',
      'Wear sunscreen and protective clothing.',
      'Consult a dermatologist regularly.'
    ],
  },
  'bkl': {
    explanation: 'Benign keratosis is a non-cancerous growth that can appear on the skin.',
    link: 'https://www.aad.org/public/diseases/skin-conditions/benign-keratosis',
    recommendations: [
      'Keep the area clean and dry.',
      'Consult a dermatologist if it becomes painful or changes.'
    ],
  },
  'bcc': {
    explanation: 'Basal cell carcinoma is the most common type of skin cancer.',
    link: 'https://www.aad.org/public/diseases/skin-cancer/types/basal-cell-carcinoma',
    recommendations: [
      'Avoid sun exposure and use sunscreen.',
      'See a dermatologist for any suspicious growths.'
    ],
  },
  'akiec': {
    explanation: 'Actinic keratosis is a pre-cancerous skin condition caused by sun exposure.',
    link: 'https://www.aad.org/public/diseases/skin-cancer/types/actinic-keratosis',
    recommendations: [
      'Use sunscreen and protective clothing.',
      'See a dermatologist for treatment options.'
    ],
  },
  'vasc': {
    explanation: 'Vascular lesions can appear in a variety of forms and are usually benign.',
    link: 'https://www.ncbi.nlm.nih.gov/books/NBK547990/',
    recommendations: [
      'Monitor any changes in the lesions.',
      'Consult a dermatologist if concerned.'
    ],
  },
  'df': {
    explanation: 'Dermatofibroma is a common benign skin growth that often appears on the legs.',
    link: 'https://www.aad.org/public/diseases/skin-conditions/dermatofibroma',
    recommendations: [
      'Monitor for any changes.',
      'Consult a dermatologist for removal options if desired.'
    ],
  },
};

interface ResultsComponentProps {
  analysisResult: {
    prediction: Condition;
    confidence: number;
  };
  setCurrentTab: (tab: string) => void;
  imageUrl: string;
}

const ResultsComponent: React.FC<ResultsComponentProps> = ({ analysisResult, setCurrentTab, imageUrl }) => {
  const router = useRouter();
  const { user } = useAuth();

  const getSeverityLevel = (className: Condition): string => {
    switch (className) {
      case 'mel':
        return 'High';
      case 'bcc':
      case 'akiec':
        return 'Medium';
      default:
        return 'Low';
    }
  };

  const saveToHistory = async () => {
    if (!user) {
      alert('You must be logged in to save to history.');
      return;
    }

    try {
      const historyRef = collection(db, 'history');
      await addDoc(historyRef, {
        userId: user.uid,
        prediction: analysisResult.prediction,
        confidence: analysisResult.confidence,
        severity: getSeverityLevel(analysisResult.prediction),
        imageUrl: imageUrl,
        date: new Date(),
      });
      alert('Analysis saved to history successfully.');
    } catch (err) {
      console.error('Error saving analysis to history:', err);
      alert('Failed to save analysis to history.');
    }
  };

  const conditionInfo = conditionExplanations[analysisResult.prediction];

  return (
    <div className="bg-[#0D111D] p-4 rounded-lg text-[#EFEFED]">
      <h2 className="text-2xl mb-4">Analysis Results</h2>
      
      <div className="mb-6">
        <h3 className="text-xl mb-2">Predicted Condition: {analysisResult.prediction}</h3>
        <p>Confidence: {(analysisResult.confidence * 100).toFixed(2)}%</p>
        <p>Severity: {getSeverityLevel(analysisResult.prediction)}</p>
        {conditionInfo && (
          <div className="mt-4">
            <p>{conditionInfo.explanation}</p>
            <a href={conditionInfo.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Learn more about {analysisResult.prediction}</a>
            <h4 className="mt-2 font-bold">Recommendations:</h4>
            <ul className="list-disc list-inside">
              {conditionInfo.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <ButtonStyling text="Save to History" onClick={saveToHistory} />
        <ButtonStyling text="Learn More" onClick={() => router.push('/education')} />
        <ButtonStyling text="Back to Analysis" onClick={() => setCurrentTab('analysis')} />
      </div>
    </div>
  );
};

export default ResultsComponent;