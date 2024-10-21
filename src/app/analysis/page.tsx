'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AnalysisComponent from '../../components/Analysis/AnalysisComponent';
import ResultsComponent from '../../components/Analysis/ResultsComponent';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisResult {
  prediction: 'nv' | 'mel' | 'bkl' | 'bcc' | 'akiec' | 'vasc' | 'df';
  confidence: number;
}

const AnalysisPage = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('analysis');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center text-[#EFEFED] p-4"
      >
        Please log in to access the analysis feature.
      </motion.div>
    );
  }

  const handleAnalysisComplete = (result: AnalysisResult, url: string) => {
    setAnalysisResult(result);
    setImageUrl(url);
    setCurrentTab('results');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-6 text-[#EFEFED]">Skin Analysis</h1>
      <AnimatePresence mode="wait">
        {currentTab === 'analysis' ? (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
          >
            <AnalysisComponent onAnalysisComplete={handleAnalysisComplete} />
          </motion.div>
        ) : (
          analysisResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
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