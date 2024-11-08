'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, db }from '../../Firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiArrowLeft, FiCalendar, FiActivity } from 'react-icons/fi';
import { format } from 'date-fns';
import ButtonStyling from '../../components/ButtonStyling';
import { handleError } from '../../utils/errorHandler';
import { getConditionInfo } from '../../utils/severityCalculator';

const AnalysisDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!user || !params?.id) {
        router.push('/login');
        return;
      }

      try {
        const analysisDoc = await getDoc(doc(db, 'history', params.id as string));
        if (!analysisDoc.exists()) {
          throw new Error('Analysis not found');
        }

        const data = analysisDoc.data();
        setAnalysis({
          ...data,
          id: analysisDoc.id,
          date: data.date.toDate(),
        });
      } catch (error) {
        handleError(error, 'fetching analysis details');
        router.push('/analyses');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [params?.id, user, router]);

  if (loading) return <div>Loading...</div>;
  if (!analysis) return <div>Analysis not found</div>;

  const conditionInfo = getConditionInfo(analysis.prediction);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <button
        onClick={() => router.back()}
        className="flex items-center text-[#9C9FA4] hover:text-[#EFEFED] mb-6"
      >
        <FiArrowLeft className="mr-2" /> Back to History
      </button>

      <div className="bg-[#262A36] rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-96 bg-[#171B26] rounded-lg overflow-hidden">
            <Image
              src={analysis.imageUrl}
              alt={analysis.conditionName}
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#EFEFED] mb-2">
                {analysis.conditionName}
              </h1>
              <div className="flex items-center text-[#9C9FA4] mb-4">
                <FiCalendar className="mr-2" />
                {format(analysis.date, 'MMMM d, yyyy')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#171B26] p-4 rounded-lg">
                <div className="text-[#9C9FA4] mb-1">Confidence</div>
                <div className="text-xl font-semibold">
                  {analysis.confidence.toFixed(2)}%
                </div>
              </div>
              <div className="bg-[#171B26] p-4 rounded-lg">
                <div className="text-[#9C9FA4] mb-1">Severity</div>
                <div className="text-xl font-semibold">{analysis.severity}</div>
              </div>
            </div>

            <div className="bg-[#171B26] p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-[#9C9FA4]">{conditionInfo.description}</p>
            </div>

            <div className="bg-[#171B26] p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Recommendations</h3>
              <ul className="list-disc list-inside text-[#9C9FA4] space-y-2">
                {conditionInfo.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <ButtonStyling
              text="Schedule Consultation"
              onClick={() => router.push('/appointments/schedule')}
              variant="primary"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisDetail;