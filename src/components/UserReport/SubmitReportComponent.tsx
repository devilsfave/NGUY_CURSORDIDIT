import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { firestore as db } from '../../Firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import ButtonStyling from '../ButtonStyling';

const SubmitReportComponent: React.FC = () => {
  const [reportContent, setReportContent] = useState('');
  const { user } = useAuth();

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'userReports'), {
        userId: user.uid,
        content: reportContent,
        status: 'pending',
        createdAt: new Date()
      });
      alert('Report submitted successfully');
      setReportContent('');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
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
          placeholder="Describe your issue or concern..."
          required
        />
        <ButtonStyling text="Submit Report" />
      </form>
    </div>
  );
};

export default SubmitReportComponent;