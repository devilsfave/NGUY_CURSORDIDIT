import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../../../contexts/AuthContext';
import RefreshButton from '../../common/RefreshButton';
import { DashboardNotifications } from './DashboardNotifications';
import ErrorBoundary from '../../common/ErrorBoundary';

interface DashboardLayoutProps {
  user: User;
  title: string;
  isRefreshing?: boolean;
  onRefresh?: () => Promise<void>;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  title,
  isRefreshing = false,
  onRefresh,
  children
}) => {
  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 md:p-8 max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#EFEFED]">
            {title}
          </h2>
          <div className="flex items-center gap-4">
            <DashboardNotifications userId={user.uid} role={user.role} />
            {onRefresh && <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />}
          </div>
        </div>
        {children}
      </motion.div>
    </ErrorBoundary>
  );
};

export default DashboardLayout;