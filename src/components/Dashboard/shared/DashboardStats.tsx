import { motion } from 'framer-motion';
import { FiUsers, FiClock, FiCheckCircle, FiStar, FiBarChart2, FiPercent } from 'react-icons/fi';
import { formatConfidence } from '../../../utils/confidenceFormatter';

interface StatCardProps {
  icon?: React.ReactNode;
  title: string;
  value: number;
  suffix?: string;
  loading?: boolean;
  error?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  title, 
  value, 
  suffix, 
  loading = false, 
  error = false 
}) => {
  // Format the value based on whether it's a confidence percentage
  const formatValue = (val: number, title: string) => {
    if (title.toLowerCase().includes('confidence')) {
      return formatConfidence(val);
    }
    return val;
  };

  const displayValue = value !== undefined ? formatValue(value, title) : '-';
  
  if (loading) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-[#262A36] p-4 rounded-lg animate-pulse"
      >
        <div className="flex items-center mb-2">
          <span className="text-[#9C9FA4]">{icon || <FiBarChart2 className="w-6 h-6" />}</span>
        </div>
        <h3 className="text-sm text-[#9C9FA4]">{title}</h3>
        <p className="text-2xl font-bold text-[#EFEFED]">Loading...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-[#262A36] p-4 rounded-lg"
      >
        <div className="flex items-center mb-2">
          <span className="text-[#9C9FA4]">{icon || <FiBarChart2 className="w-6 h-6" />}</span>
        </div>
        <h3 className="text-sm text-[#9C9FA4]">{title}</h3>
        <p className="text-2xl font-bold text-red-500">Error</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-[#262A36] p-4 rounded-lg"
    >
      <div className="flex items-center mb-2">
        <span className="text-[#9C9FA4]">{icon || <FiBarChart2 className="w-6 h-6" />}</span>
      </div>
      <h3 className="text-sm text-[#9C9FA4]">{title}</h3>
      <p className="text-2xl font-bold text-[#EFEFED]">
        {displayValue}{suffix && suffix}
      </p>
    </motion.div>
  );
};
