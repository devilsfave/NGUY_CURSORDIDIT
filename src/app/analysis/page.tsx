'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AnalysisComponent from '../../components/Analysis/AnalysisComponent';
import ResultsComponent from '../../components/Analysis/ResultsComponent';

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
    return <div className="text-center text-[#EFEFED]">Please log in to access the analysis feature.</div>;
  }

  const handleAnalysisComplete = (result: AnalysisResult, url: string) => {
    setAnalysisResult(result);
    setImageUrl(url);
    setCurrentTab('results');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-[#EFEFED]">Skin Analysis</h1>
      {currentTab === 'analysis' ? (
        <AnalysisComponent
          onAnalysisComplete={handleAnalysisComplete}
        />
      ) : (
        analysisResult && (
          <ResultsComponent
            analysisResult={analysisResult}
            setCurrentTab={setCurrentTab}
            imageUrl={imageUrl}
          />
        )
      )}
    </div>
  );
};

export default AnalysisPage;