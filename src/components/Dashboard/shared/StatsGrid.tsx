import React from 'react';
import { StatCard } from './DashboardStats';
import { motion } from 'framer-motion';

interface StatItem {
  icon: React.ReactNode;
  title: string;
  value: number;
  suffix?: string;
}

interface StatsGridProps {
  stats: StatItem[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
    >
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          title={stat.title}
          value={stat.value}
          suffix={stat.suffix}
        />
      ))}
    </motion.div>
  );
};

export default StatsGrid;