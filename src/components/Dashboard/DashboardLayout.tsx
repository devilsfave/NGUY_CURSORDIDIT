import React, { ReactNode } from 'react';
import { User } from '../../contexts/AuthContext';
import ClientNavigation from '../Navigation/ClientNavigation';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
  user: User;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user, title }) => {
  return (
    <div className="min-h-screen bg-[#0F1117]">
      <ClientNavigation />
      
      <main className="p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#EFEFED]">{title}</h1>
          </div>
          
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;