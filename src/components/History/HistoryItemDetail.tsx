import React from 'react';
import ButtonStyling from '../ButtonStyling';
import { Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { auth, db }from '../../Firebase/config';
import type { Analysis } from '../../types/analysis';

interface HistoryItemDetailProps {
  item: Analysis;
  onClose: () => void;
}

const HistoryItemDetail: React.FC<HistoryItemDetailProps> = ({ item, onClose }) => {
  const handleDelete = async () => {
    try {
      // Changed the collection reference to 'analyses'
      const historyRef = doc(db, 'analyses', item.id);
      await deleteDoc(historyRef);
      toast.success('Analysis deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error('Failed to delete analysis');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative bg-[#171B26] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#EFEFED] hover:text-gray-300 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#EFEFED] pr-8">Analysis Details</h2>
          
          <div className="space-y-4">
            <img src={item.imageUrl} alt="Analysis" className="w-full h-auto rounded" />
            
            <div className="bg-[#262A36] p-4 rounded-lg space-y-2">
              <p className="text-[#EFEFED]">
                <span className="font-semibold">Condition:</span> {item.condition}
              </p>
              {item.description && (
                <p className="text-[#9C9FA4] text-sm">
                  {item.description}
                </p>
              )}
              <p className="text-[#EFEFED]">
                <span className="font-semibold">Confidence:</span> {(item.confidence * 100).toFixed(2)}%
              </p>
              <p className="text-[#EFEFED]">
                <span className="font-semibold">Severity:</span> {item.severity}
              </p>
              <p className="text-[#EFEFED]">
                <span className="font-semibold">Date:</span> {
                  item.createdAt instanceof Timestamp ? 
                    item.createdAt.toDate().toLocaleString() : 
                    new Date(item.createdAt).toLocaleString()
                }
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <ButtonStyling text="Delete" onClick={handleDelete} variant="danger" />
              <ButtonStyling text="Close" onClick={onClose} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryItemDetail;