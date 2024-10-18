'use client';

import React, { useEffect, useState } from 'react';
import { firestore as db } from '../../Firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface HistoryItem {
  id: string;
  imageUrl: string;
  prediction: string;
  confidence: number;
  date: Date;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      const historyRef = collection(db, 'history');
      const q = query(
        historyRef,
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const historyData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HistoryItem));
      setHistory(historyData);
    };

    fetchHistory();
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-[#EFEFED]">Analysis History</h1>
      {history.map((item) => (
        <div key={item.id} className="mb-4 p-4 bg-[#171B26] rounded-lg">
          <img src={item.imageUrl} alt="Analysis" className="w-32 h-32 object-cover mb-2" />
          <p className="text-[#EFEFED]">Prediction: {item.prediction}</p>
          <p className="text-[#EFEFED]">Confidence: {(item.confidence * 100).toFixed(2)}%</p>
          <p className="text-[#EFEFED]">Date: {item.date.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}