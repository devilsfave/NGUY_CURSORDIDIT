'use client';

import React, { useEffect, useState } from 'react';
import { firestore as db } from '../../Firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import ButtonStyling from '../../components/ButtonStyling';

interface HistoryItem {
  id: string;
  imageUrl: string;
  prediction: string;
  confidence: number;
  date: Date;
  severity: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadMore, setLoadMore] = useState(false);

  const fetchHistory = async (lastItem?: HistoryItem) => {
    if (!user) return;

    setLoading(true);
    const historyRef = collection(db, 'history');
    let q = query(
      historyRef,
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(10)
    );

    if (lastItem) {
      q = query(q, where('date', '<', lastItem.date));
    }

    const querySnapshot = await getDocs(q);
    const historyData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    } as HistoryItem));

    if (lastItem) {
      setHistory(prev => [...prev, ...historyData]);
    } else {
      setHistory(historyData);
    }

    setLoadMore(querySnapshot.docs.length === 10);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleLoadMore = () => {
    if (history.length > 0) {
      fetchHistory(history[history.length - 1]);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#EFEFED]">Analysis History</h1>
      {loading && history.length === 0 ? (
        <p className="text-[#EFEFED]">Loading...</p>
      ) : (
        <>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {history.map((item) => (
              <motion.div 
                key={item.id} 
                className="bg-[#171B26] rounded-lg overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <img src={item.imageUrl} alt="Analysis" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <p className="text-[#EFEFED] font-semibold text-sm md:text-base">Prediction: {item.prediction}</p>
                  <p className="text-[#EFEFED] text-sm">Confidence: {(item.confidence * 100).toFixed(2)}%</p>
                  <p className="text-[#EFEFED] text-sm">Severity: {item.severity}</p>
                  <p className="text-[#EFEFED] text-xs mt-2">{item.date.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          {loadMore && (
            <div className="mt-6 text-center">
              <ButtonStyling text="Load More" onClick={handleLoadMore} className="w-full sm:w-auto" />
            </div>
          )}
        </>
      )}
    </div>
  );
}