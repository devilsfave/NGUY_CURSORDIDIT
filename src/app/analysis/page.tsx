'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AnalysisComponent from '../../components/Analysis/AnalysisComponent';
import ResultsComponent from '../../components/Analysis/ResultsComponent';
import { motion, AnimatePresence } from 'framer-motion';
import type { Condition } from '../../utils/severityCalculator';

interface PredictionResult {
  prediction: Condition;
  confidence: number;
}

const AnalysisPage = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'analysis' | 'results'>('analysis');
  const [analysisResult, setAnalysisResult] = useState<PredictionResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-[#EFEFED] p-4"
      >
        Please log in to access the analysis feature.
      </motion.div>
    );
  }

  const handleAnalysisComplete = (result: PredictionResult, imageUrl: string) => {
    console.log('Analysis complete:', result); // Debug log
    setAnalysisResult(result);
    setImageUrl(imageUrl);
    setCurrentTab('results');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-6 text-[#EFEFED]">Skin Analysis</h1>
      
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EFEFED] mx-auto"></div>
            <p className="text-[#EFEFED] mt-4">Analyzing image...</p>
          </motion.div>
        ) : currentTab === 'analysis' ? (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <AnalysisComponent 
              onAnalysisComplete={handleAnalysisComplete}
              user={user}
            />
          </motion.div>
        ) : (
          analysisResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ResultsComponent
                analysisResult={analysisResult}
                setCurrentTab={setCurrentTab}
                imageUrl={imageUrl}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnalysisPage;