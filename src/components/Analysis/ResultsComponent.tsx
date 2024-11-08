import React, { useEffect, useState } from 'react';
import ButtonStyling from "../ButtonStyling";
import { auth, db }from '../../Firebase/config';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { calculateSeverity, getConditionInfo } from '../../utils/severityCalculator';
import { handleError } from '../../utils/errorHandler';
import type { Condition, ConditionInfo } from '../../utils/severityCalculator';
import { updateSystemStats } from '../../utils/systemStats';
import { Analysis, normalizeSeverity } from '../../types/analysis';
import { saveAnalysisResults } from '../../services/analysisService';
import { formatConfidence } from '../../utils/confidenceFormatter'; // Added import

interface ResultsComponentProps {
  analysisResult: {
    prediction: Condition;
    confidence: number;
  };
  setCurrentTab: (tab: 'analysis' | 'results') => void;
  imageUrl: string;
}

const ResultsComponent: React.FC<ResultsComponentProps> = ({ analysisResult, setCurrentTab, imageUrl }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [conditionInfo, setConditionInfo] = useState<ConditionInfo | null>(null);

  const prediction = analysisResult.prediction;
  const confidence = analysisResult.confidence;

  useEffect(() => {
    setConditionInfo(getConditionInfo(prediction));
  }, [prediction]);

  const saveToHistory = async () => {
    if (!user) {
      toast.error('You must be logged in to save to history.');
      return;
    }

    try {
      const info = getConditionInfo(prediction);
      
      await saveAnalysisResults({
        userId: user.uid,
        imageUrl: imageUrl,
        result: prediction,
        prediction: prediction,
        confidence: formatConfidence(confidence),
        severity: calculateSeverity(prediction, confidence),
        condition: info.name,
        conditionName: info.name,
        description: info.description,
        date: Timestamp.fromDate(new Date()),
        type: 'analysis',
        attachedToAppointment: false,
        attachedAt: undefined,
        appointmentId: undefined
      }, user);

      toast.success('Analysis saved successfully.');
      router.push('/history');
    } catch (error) {
      await handleError(error, 'saveToHistory', {
        context: 'analysis saving',
        severity: 'error',
        additionalInfo: `User: ${user.uid}, Prediction: ${prediction}`
      });
    }
  };

  if (!conditionInfo) return null;

  const getSeverityColor = (severity: string) => {
    const normalizedSeverity = normalizeSeverity(severity);
    switch (normalizedSeverity) {
      case 'High':
        return 'text-red-500';
      case 'Medium':
        return 'text-yellow-500';
      case 'Low':
        return 'text-green-500';
      default:
        return 'text-[#EFEFED]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#171B26] p-6 rounded-lg shadow-lg text-[#EFEFED]"
    >
      <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative h-64 bg-[#262A36] rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt="Analyzed skin image"
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>

        <div className="space-y-4">
          <div className={`text-xl font-semibold ${getSeverityColor(conditionInfo.severity)}`}>
            Predicted Condition: {conditionInfo.name}
          </div>
          <div>Confidence: {formatConfidence(confidence)}%</div>
          <div className={`font-semibold ${getSeverityColor(conditionInfo.severity)}`}>
            Severity: {conditionInfo.severity}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#262A36] rounded-lg">
        <p className="mb-4">{conditionInfo.description}</p>
        {conditionInfo.link && (
          <a 
            href={conditionInfo.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:underline block mb-4"
          >
            Learn more about {conditionInfo.name}
          </a>
        )}
        <h4 className="font-bold mb-2">Recommendations:</h4>
        <ul className="list-disc list-inside space-y-2">
          {conditionInfo.recommendations.map((rec: string, index: number) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ButtonStyling 
          text="Save to History" 
          onClick={saveToHistory}
          variant="primary"
        />
        <ButtonStyling 
          text="Learn More" 
          onClick={() => router.push('/education')}
          variant="secondary"
        />
        <ButtonStyling 
          text="New Analysis" 
          onClick={() => setCurrentTab('analysis')}
          variant="secondary"
        />
      </div>
    </motion.div>
  );
};

export default ResultsComponent;
