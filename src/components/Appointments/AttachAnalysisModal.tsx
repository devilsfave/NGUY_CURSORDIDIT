import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db }from '../../Firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  writeBatch,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { subscribeToAnalyses } from '../../services/realtimeUpdates';
import type { Analysis } from '../../types/analysis';
import ButtonStyling from '../ButtonStyling';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { FiAlertCircle, FiCheck, FiImage, FiLoader } from 'react-icons/fi';

interface AttachAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientId: string;
  onSuccess?: (analysisId: string) => void;
}

type FilterSeverity = 'all' | 'Low' | 'Medium' | 'High';

const compareTimestamps = (a: Timestamp, b: Timestamp): number => {
  if (!a || !b) return 0;
  return b.seconds - a.seconds || b.nanoseconds - a.nanoseconds;
};

const AttachAnalysisModal: React.FC<AttachAnalysisModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  patientId,
  onSuccess
}) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sortBy, setSortBy] = useState<'date' | 'confidence'>('date');
  const [filterBySeverity, setFilterBySeverity] = useState<FilterSeverity>('all');

  const filteredAnalyses = analyses.filter(analysis => {
    if (filterBySeverity === 'all') return true;
    return analysis.severity === filterBySeverity;
  });

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'analyses'),
          where('patientId', '==', patientId),
          where('attachedToAppointment', '==', false)
        );
        
        const snapshot = await getDocs(q);
        let analysesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt || Timestamp.now()
        })) as Analysis[];

        // Apply sorting
        analysesData = analysesData.sort((a, b) => {
          if (sortBy === 'date') {
            return compareTimestamps(b.createdAt, a.createdAt); // Newest first
          }
          return (b.confidence || 0) - (a.confidence || 0);
        });

        // Apply filtering
        if (filterBySeverity !== 'all') {
          analysesData = analysesData.filter(a => a.severity === filterBySeverity);
        }
        
        setAnalyses(analysesData);
      } catch (error) {
        console.error('Error fetching analyses:', error);
        setError('Failed to load analyses. Please try again.');
        toast.error('Failed to load analyses');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [isOpen, patientId, sortBy, filterBySeverity, retryCount]);

  const handleAttach = async () => {
    if (!selectedAnalysisId) {
      toast.warning('Please select an analysis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const batch = writeBatch(db);
      
      // Update appointment
      const appointmentRef = doc(db, 'appointments', appointmentId);
      batch.update(appointmentRef, {
        attachedAnalysisId: selectedAnalysisId,
        updatedAt: new Date()
      });

      // Update analysis
      const analysisRef = doc(db, 'analyses', selectedAnalysisId);
      batch.update(analysisRef, {
        attachedToAppointment: true,
        appointmentId,
        attachedAt: new Date()
      });

      await batch.commit();

      toast.success('Analysis attached successfully');
      onSuccess?.(selectedAnalysisId);
      onClose();
    } catch (error) {
      console.error('Error attaching analysis:', error);
      setError('Failed to attach analysis. Please try again.');
      toast.error('Failed to attach analysis');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-[#171B26] p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#EFEFED]">Attach Analysis</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('date')}
                  className={`p-2 rounded-md ${sortBy === 'date' ? 'bg-blue-500/20 border border-blue-500' : 'hover:bg-blue-500/20'}`}
                >
                  <FiImage size={16} />
                </button>
                <button
                  onClick={() => setSortBy('confidence')}
                  className={`p-2 rounded-md ${sortBy === 'confidence' ? 'bg-blue-500/20 border border-blue-500' : 'hover:bg-blue-500/20'}`}
                >
                  <FiLoader size={16} />
                </button>
                <button
                  onClick={() => setFilterBySeverity('all')}
                  className={`p-2 rounded-md ${filterBySeverity === 'all' ? 'bg-blue-500/20 border border-blue-500' : 'hover:bg-blue-500/20'}`}
                >
                  <FiAlertCircle size={16} />
                </button>
                <button
                  onClick={() => setFilterBySeverity('Low')}
                  className={`p-2 rounded-md ${filterBySeverity === 'Low' ? 'bg-blue-500/20 border border-blue-500' : 'hover:bg-blue-500/20'}`}
                >
                  <FiAlertCircle size={16} />
                </button>
                <button
                  onClick={() => setFilterBySeverity('Medium')}
                  className={`p-2 rounded-md ${filterBySeverity === 'Medium' ? 'bg-blue-500/20 border border-blue-500' : 'hover:bg-blue-500/20'}`}
                >
                  <FiAlertCircle size={16} />
                </button>
                <button
                  onClick={() => setFilterBySeverity('High')}
                  className={`p-2 rounded-md ${filterBySeverity === 'High' ? 'bg-blue-500/20 border border-blue-500' : 'hover:bg-blue-500/20'}`}
                >
                  <FiAlertCircle size={16} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#EFEFED]"></div>
              </div>
            ) : (
              <>
                {analyses.length > 0 ? (
                  <div className="space-y-4">
                    {analyses.map((analysis) => (
                      <div
                        key={analysis.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedAnalysisId === analysis.id
                            ? 'bg-blue-500/20 border border-blue-500'
                            : 'bg-[#262A36] hover:bg-[#2A2F3F]'
                        }`}
                        onClick={() => setSelectedAnalysisId(analysis.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[#EFEFED] font-medium">
                              {analysis.conditionName || analysis.prediction}
                            </p>
                            <p className="text-[#9C9FA4] text-sm">
                              {format(analysis.createdAt.toDate(), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <span className="text-[#9C9FA4]">
                            {Math.min(Math.round(analysis.confidence), 100)}% confidence
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#9C9FA4] text-center py-4">No analyses available</p>
                )}

                {error && (
                  <p className="text-red-500 text-sm mt-4">{error}</p>
                )}

                <div className="flex justify-end space-x-4 mt-6">
                  <ButtonStyling
                    text="Cancel"
                    onClick={onClose}
                    variant="secondary"
                    disabled={loading}
                  />
                  <ButtonStyling
                    text={loading ? 'Attaching...' : 'Attach'}
                    onClick={handleAttach}
                    disabled={loading || !selectedAnalysisId}
                  />
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AttachAnalysisModal;
