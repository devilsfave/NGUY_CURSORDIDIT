import React from 'react';
import { motion } from 'framer-motion';

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh, isRefreshing }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onRefresh}
      disabled={isRefreshing}
      className="p-2 rounded-full hover:bg-[#1F2937] transition-colors"
    >
      <motion.svg
        animate={isRefreshing ? { rotate: 360 } : {}}
        transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
        className="w-5 h-5 text-[#EFEFED]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </motion.svg>
    </motion.button>
  );
};

export default RefreshButton;