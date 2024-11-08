'use client';

import React, { useState, useEffect } from 'react';
import { auth, db }from '../../Firebase/config';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiCalendar, FiActivity, FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ButtonStyling from '../../components/ButtonStyling';
import { handleError } from '../../utils/errorHandler';
import { toast } from 'react-toastify';

interface Analysis {
  id: string;
  prediction: string;
  confidence: number;
  severity: string;
  conditionName: string;
  conditionDescription?: string;
  imageUrl: string;
  date: Date;
  createdAt: Date;
  result?: string;
  condition?: string;
  description?: string;
}

const AnalysisHistory = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        
        const historyRef = collection(db, 'history');
        const analysesRef = collection(db, 'analyses');
        
        const [historySnapshot, analysesSnapshot] = await Promise.all([
          getDocs(query(historyRef, where('userId', '==', user.uid))),
          getDocs(query(analysesRef, where('userId', '==', user.uid)))
        ]);

        const allAnalyses = [...historySnapshot.docs, ...analysesSnapshot.docs]
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              prediction: data.prediction || data.result || data.condition || '',
              confidence: Number(data.confidence) || 0,
              severity: data.severity || 'low',
              conditionName: data.conditionName || data.condition || data.prediction || '',
              conditionDescription: data.conditionDescription || data.description || '',
              imageUrl: data.imageUrl || '',
              date: data.date?.toDate() || new Date(),
              createdAt: data.createdAt?.toDate() || new Date()
            } as Analysis;
          })
          .filter((analysis, index, self) => 
            index === self.findIndex((a) => a.imageUrl === analysis.imageUrl)
          );

        setAnalyses(allAnalyses);
      } catch (error) {
        console.error('Error fetching analyses:', error);
        toast.error('Failed to load analysis history');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [user, router]);

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.conditionName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || analysis.severity.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-[#EFEFED]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-2xl font-bold text-[#EFEFED] mb-6">Analysis History</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9C9FA4]" />
          <input
            type="text"
            placeholder="Search by condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#262A36] text-[#EFEFED] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'high', 'medium', 'low'].map((severity) => (
            <button
              key={severity}
              onClick={() => setFilter(severity as any)}
              className={`px-4 py-2 rounded-lg ${
                filter === severity
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#262A36] text-[#9C9FA4] hover:bg-[#1F2937]'
              }`}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAnalyses.map((analysis) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#262A36] p-6 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative h-48 bg-[#171B26] rounded-lg overflow-hidden">
                <Image
                  src={analysis.imageUrl}
                  alt={analysis.conditionName}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-semibold ${getSeverityColor(analysis.severity)}`}>
                    {analysis.conditionName}
                  </h3>
                  <div className="flex items-center text-[#9C9FA4]">
                    <FiCalendar className="mr-2" />
                    {format(analysis.date, 'MMM d, yyyy')}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <FiActivity className="mr-2" />
                    Confidence: {analysis.confidence.toFixed(2)}%
                  </div>
                  <div className={`flex items-center ${getSeverityColor(analysis.severity)}`}>
                    Severity: {analysis.severity}
                  </div>
                </div>

                <ButtonStyling
                  text="View Details"
                  onClick={() => router.push(`/analyses/${analysis.id}`)}
                  variant="secondary"
                />
              </div>
            </div>
          </motion.div>
        ))}

        {filteredAnalyses.length === 0 && (
          <div className="text-center py-8 text-[#9C9FA4]">
            No analyses found
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalysisHistory;