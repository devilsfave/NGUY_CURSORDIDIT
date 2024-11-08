import React from 'react';
import { StatCard } from './shared/DashboardStats';
import { FiPercent } from 'react-icons/fi';
import { formatConfidence } from '../../utils/confidenceFormatter';

interface AnalysisStatsProps {
  confidence: number;
  loading?: boolean;
  error?: boolean;
}

export const AnalysisStats: React.FC<AnalysisStatsProps> = ({ 
  confidence,
  loading = false,
  error = false 
}) => {
  return (
      <StatCard
          icon={<FiPercent className="w-6 h-6" />}
          title="Confidence"
          value={formatConfidence(confidence)} // The formatter will handle both decimal and percentage values
          suffix="%"
          loading={loading}
          error={error}
      />
  );
};