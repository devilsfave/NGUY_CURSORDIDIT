import React, { useState, useEffect } from 'react';
import { firestore as db } from '../../Firebase/config';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';

interface HistoryItem {
  id: string;
  userId: string;
  date: Timestamp;
  analysisResult: string;
  imageUrl: string;
}

interface HistoryComponentProps {
  userId: string;
}

const HistoryComponent: React.FC<HistoryComponentProps> = ({ userId }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const historyRef = collection(db, 'history');
      const q = query(historyRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HistoryItem));
      setHistoryItems(items);
    };

    fetchHistory();
  }, [userId]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-[#EFEFED]">Analysis History</h2>
      {historyItems.length > 0 ? (
        <div className="space-y-4">
          {historyItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#262A36] p-4 rounded-lg"
            >
              <p className="text-[#EFEFED] mb-2">Date: {item.date.toDate().toLocaleString()}</p>
              <p className="text-[#EFEFED] mb-2">Result: {item.analysisResult}</p>
              <img src={item.imageUrl} alt="Analysis" className="w-full h-auto rounded-lg" />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-[#EFEFED]">No history items found.</p>
      )}
    </div>
  );
};

export default HistoryComponent;

