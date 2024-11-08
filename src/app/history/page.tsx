'use client';

import React, { useEffect, useState } from 'react';
import { auth, db }from '../../Firebase/config';
import { collection, query, getDocs, orderBy, where, limit, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import ButtonStyling from '../../components/ButtonStyling';
import { useRouter } from 'next/navigation';
import HistoryItemDetail from '../../components/History/HistoryItemDetail';
import type { Analysis } from '../../types/analysis';
import { toast } from 'react-toastify'; // Added import for toast notifications

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadMore, setLoadMore] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Analysis | null>(null);

  const fetchHistory = async (lastItem?: Analysis) => {
    if (!user) return;

    setLoading(true);
    // Changed the collection reference to 'analyses'
    const historyRef = collection(db, 'analyses');
    let q = query(
      historyRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    if (lastItem) {
      q = query(q, where('createdAt', '<', lastItem.createdAt));
    }

    try {
      const querySnapshot = await getDocs(q);
      const historyData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: user.uid,
          patientId: data.patientId,
          result: data.result || data.prediction,
          condition: data.condition || data.conditionName,
          description: data.description || data.conditionDescription,
          confidence: data.confidence,
          severity: data.severity,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt,
          doctorId: data.doctorId
        } as Analysis;
      });

      if (lastItem) {
        setHistory(prev => [...prev, ...historyData]);
      } else {
        setHistory(historyData);
      }

      setLoadMore(querySnapshot.docs.length === 10);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history'); // Added toast notification for error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const handleLoadMore = () => {
    if (history.length > 0) {
      fetchHistory(history[history.length - 1]);
    }
  };

  const handleItemClick = (item: Analysis) => {
    setSelectedItem(item);
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#EFEFED]">Analysis History</h1>
        <ButtonStyling text="Back to Dashboard" onClick={handleBack} />
      </div>
      
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
                className="bg-[#171B26] rounded-lg overflow-hidden shadow-lg cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleItemClick(item)}
              >
                <img src={item.imageUrl} alt="Analysis" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <p className="text-[#EFEFED] font-semibold text-sm md:text-base">
                    Result: {item.result}
                  </p>
                  <p className="text-[#EFEFED] text-sm">
                    Confidence: {(item.confidence * 100).toFixed(2)}%
                  </p>
                  <p className="text-[#EFEFED] text-sm">
                    Severity: {item.severity}
                  </p>
                  <p className="text-[#EFEFED] text-xs mt-2">
                    {item.createdAt instanceof Timestamp ? 
                      item.createdAt.toDate().toLocaleString() : 
                      new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {loadMore && (
            <div className="mt-6 text-center">
              <ButtonStyling 
                text="Load More" 
                onClick={handleLoadMore} 
                className="w-full sm:w-auto" 
              />
            </div>
          )}
          
          {selectedItem && (
            <HistoryItemDetail 
              item={selectedItem} 
              onClose={handleCloseDetail} 
            />
          )}
        </>
      )}
    </div>
  );
}