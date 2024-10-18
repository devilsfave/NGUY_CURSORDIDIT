'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { firestore as db } from '../../Firebase/config';
import Link from 'next/link';
import ButtonStyling from '../../components/ButtonStyling';

interface Analysis {
  id: string;
  date: string;
  result: string;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAnalyses = async () => {
      if (!user) return;

      try {
        const analysesRef = collection(db, 'analyses');
        const q = query(
          analysesRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          limit(5)
        );

        const querySnapshot = await getDocs(q);
        const analyses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Analysis));

        setRecentAnalyses(analyses);
      } catch (error) {
        console.error('Error fetching recent analyses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAnalyses();
  }, [user]);

  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-[#EFEFED]">Dashboard</h1>
      <div className="bg-[#171B26] p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-[#EFEFED]">Recent Analyses</h2>
        {loading ? (
          <p className="text-[#9C9FA4]">Loading recent analyses...</p>
        ) : recentAnalyses.length > 0 ? (
          <ul>
            {recentAnalyses.map(analysis => (
              <li key={analysis.id} className="mb-2 text-[#EFEFED]">
                <Link href={`/analysis/${analysis.id}`}>
                  {new Date(analysis.date).toLocaleDateString()} - {analysis.result}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[#9C9FA4]">No recent analyses found.</p>
        )}
        <Link href="/analysis">
          <ButtonStyling text="New Analysis" className="mt-4" />
        </Link>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-[#EFEFED]">Account Information</h2>
        <div className="text-[#EFEFED]">
          <p>Name: {user.displayName || 'Not set'}</p>
          <p>Email: {user.email}</p>
        </div>
        <Link href="/profile">
          <ButtonStyling text="Edit Profile" className="mt-4" />
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;