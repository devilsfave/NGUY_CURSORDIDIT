import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db }from '../../Firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import ButtonStyling from '../ButtonStyling';
import { updateSystemStats } from '../../utils/systemStats';
import { toast } from 'react-toastify';

const SubmitReportComponent: React.FC = () => {
  const [reportContent, setReportContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to submit a report');
      return;
    }

    setIsSubmitting(true);

    try {
      const reportRef = await addDoc(collection(db, 'userReports'), {
        doctorId: user.uid,
        content: reportContent,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const statsUpdated = await updateSystemStats({ totalReports: 1 });
      if (!statsUpdated) {
        console.warn('Failed to update system stats, but report was created');
      }

      toast.success('Report submitted successfully');
      setReportContent('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#171B26] p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-4 text-[#EFEFED]">Submit a Report</h3>
      <form onSubmit={handleSubmitReport}>
        <textarea
          className="w-full p-2 mb-4 bg-[#262A36] text-[#EFEFED] rounded"
          rows={4}
          value={reportContent}
          onChange={(e) => setReportContent(e.target.value)}
          placeholder="Enter your medical report..."
          required
          disabled={isSubmitting}
        />
        <ButtonStyling 
          text={isSubmitting ? "Submitting..." : "Submit Report"}
          disabled={isSubmitting}
        />
      </form>
    </div>
  );
};

export default SubmitReportComponent;