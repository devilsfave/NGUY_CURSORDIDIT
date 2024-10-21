"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-6 text-[#EFEFED]">Welcome to DermaVision</h1>
        <p className="text-xl text-[#9C9FA4] mb-8">AI-powered skin health analysis at your fingertips.</p>
        <button 
          onClick={handleGetStarted}
          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
        >
          {user ? 'Go to Dashboard' : 'Get Started'}
        </button>
      </section>

      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-[#EFEFED]">How It Works</h2>
          <ol className="list-decimal list-inside text-[#9C9FA4]">
            <li className="mb-2">Upload a clear photo of your skin</li>
            <li className="mb-2">Our AI analyzes your skin condition</li>
            <li className="mb-2">Receive personalized skincare recommendations</li>
            <li>Track your skin health progress over time</li>
          </ol>
        </div>
        <div className="bg-[#1F2937] p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-[#EFEFED]">Key Features</h2>
          <ul className="list-disc list-inside text-[#9C9FA4]">
            <li className="mb-2">Advanced AI skin analysis</li>
            <li className="mb-2">Personalized skincare routines</li>
            <li className="mb-2">Progress tracking and insights</li>
            <li>Expert dermatologist consultations</li>
          </ul>
        </div>
      </section>

      <section className="text-center mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-[#EFEFED]">Trusted by Dermatologists</h2>
        <p className="text-[#9C9FA4] mb-6">Our AI-powered analysis is backed by leading skin health experts.</p>
        <div className="flex justify-center items-center space-x-8">
          <div className="flex flex-col items-center">
            <Image
              src="/DERMATOLOGISTS IMAGES/Dr. Rue Compton.jpg"
              alt="Dr. Rue Compton"
              width={96}
              height={96}
              className="rounded-full"
            />
            <p className="mt-2 text-sm text-[#EFEFED]">Dr. Rue Compton</p>
            <p className="text-xs text-[#9C9FA4]">Dermatologist</p>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="/DERMATOLOGISTS IMAGES/DERMATOLOGIST EXPERTS.png"
              alt="Dermatologist Experts"
              width={96}
              height={96}
              className="rounded-full"
            />
            <p className="mt-2 text-sm text-[#EFEFED]">Dermatologist Experts</p>
            <p className="text-xs text-[#9C9FA4]">Company</p>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="/DERMATOLOGISTS IMAGES/DR. Devlin McKhay.jpg"
              alt="Dr. Devlin McKhay"
              width={96}
              height={96}
              className="rounded-full"
            />
            <p className="mt-2 text-sm text-[#EFEFED]">DR. Devlin McKhay</p>
            <p className="text-xs text-[#9C9FA4]">Dermatologist</p>
          </div>
        </div>
      </section>

      <section className="bg-[#1F2937] p-8 rounded-lg text-center">
        <h2 className="text-2xl font-semibold mb-4 text-[#EFEFED]">Ready to Transform Your Skincare Routine?</h2>
        <p className="text-[#9C9FA4] mb-6">Join thousands of satisfied users who have improved their skin health with DermaVision.</p>
        {!user && (
          <Link href="/auth" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg">
            Sign Up Now
          </Link>
        )}
      </section>
    </div>
  );
}