import React, { useState, useEffect } from 'react';
import { auth, db } from '../../Firebase/config';
import { collection, query, getDocs, orderBy, where, Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import HistoryItemDetail from './HistoryItemDetail';
import type { Analysis } from '../../types/analysis';
import { toast } from 'react-toastify';
import { convertTimestampToDate } from '../../utils/dateUtils';

interface HistoryComponentProps {
  userId: string;
}

const HistoryComponent: React.FC<HistoryComponentProps> = ({ userId }) => {
  const [historyItems, setHistoryItems] = useState<Analysis[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);
      try {
        // Fetch from analyses
        const analysesRef = collection(db, 'analyses');
        const analysesQuery = query(
          analysesRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const analysesSnapshot = await getDocs(analysesQuery);
        
        // Normalize analyses data to match Analysis type
        const analysesItems = analysesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            patientId: data.patientId,
            prediction: data.result || data.prediction,
            confidence: data.confidence,
            severity: data.severity,
            conditionName: data.condition || data.conditionName,
            conditionDescription: data.description || data.conditionDescription,
            imageUrl: data.imageUrl,
            createdAt: data.createdAt,
            date: data.date || data.createdAt, // Use date or fallback to createdAt
            type: 'analysis' as const,
            attachedToAppointment: data.attachedToAppointment || false,
            appointmentId: data.appointmentId || undefined,
            attachedAt: data.attachedAt || undefined,
            doctorId: data.doctorId || undefined,
            notes: data.notes || undefined,
            result: data.result || data.prediction,
            condition: data.condition || data.conditionName,
            description: data.description || data.conditionDescription
          } as Analysis;
        });
        
        // Sort by date
        const sortedItems = analysesItems.sort((a, b) => {
          // Convert both timestamps to milliseconds for comparison
          const dateA = (a.createdAt instanceof Timestamp) 
            ? a.createdAt.toMillis() 
            : convertTimestampToDate(a.createdAt).getTime();
            
          const dateB = (b.createdAt instanceof Timestamp) 
            ? b.createdAt.toMillis() 
            : convertTimestampToDate(b.createdAt).getTime();
            
          return dateB - dateA;
        });
        
        setHistoryItems(sortedItems);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load history. Please try again.');
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  const handleItemClick = (item: Analysis) => {
    setSelectedItem(item);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  const handleError = (error: any) => {
    console.error('History error:', error);
    toast.error(error.message || 'Failed to load history. Please try again.');
    
    // If it's a permission error, suggest logging out and back in
    if (error.code === 'permission-denied') {
      toast.info('Try logging out and back in if the problem persists');
    }
  };

  if (loading) {
    return <p className="text-[#EFEFED]">Loading...</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-[#EFEFED]">Analysis History</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {historyItems.length > 0 ? (
        <div className="space-y-4">
          {historyItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#262A36] p-4 rounded-lg cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <p className="text-[#EFEFED] mb-2">
                Date: {item.createdAt instanceof Timestamp ? 
                  item.createdAt.toDate().toLocaleString() : 
                  new Date(item.createdAt).toLocaleString()}
              </p>
              <p className="text-[#EFEFED] mb-2">Result: {item.prediction}</p>
              <img src={item.imageUrl} alt="Analysis" className="w-full h-auto rounded-lg" />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-[#EFEFED]">No history items found.</p>
      )}
      
      {selectedItem && (
        <HistoryItemDetail 
          item={selectedItem} 
          onClose={handleCloseDetail} 
        />
      )}
    </div>
  );
};

export default HistoryComponent;