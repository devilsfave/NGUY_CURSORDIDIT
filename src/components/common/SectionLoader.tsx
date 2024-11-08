import React from 'react';
import { motion } from 'framer-motion';

interface SectionLoaderProps {
  text?: string;
}

const SectionLoader: React.FC<SectionLoaderProps> = ({ text = 'Loading...' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center p-8"
    >
      <motion.div
        className="h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="mt-4 text-[#9C9FA4]">{text}</p>
    </motion.div>
  );
};

export default SectionLoader;