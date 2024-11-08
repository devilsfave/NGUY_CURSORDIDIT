"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      if (user) {
        await router.push('/dashboard');
      } else {
        await router.push('/auth');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const dermatologists = [
    {
      src: "/DERMATOLOGISTS IMAGES/Dr. Rue Compton.jpg",
      name: "Dr. Rue Compton",
      title: "Dermatologist"
    },
    {
      src: "/DERMATOLOGISTS IMAGES/DERMATOLOGIST EXPERTS.png",
      name: "Dermatologist Experts",
      title: "Company"
    },
    {
      src: "/DERMATOLOGISTS IMAGES/DR. Devlin McKhay.jpg",
      name: "DR. Devlin McKhay",
      title: "Dermatologist"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-6 text-[#EFEFED]">Welcome to DermaVision</h1>
        <p className="text-xl text-[#9C9FA4] mb-8">AI-powered skin health analysis at your fingertips.</p>
        <button 
          onClick={handleGetStarted}
          disabled={isLoading}
          className={`bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3 px-6 rounded-lg 
                     transition-all duration-300 transform hover:scale-105
                     ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
          ) : user ? 'Go to Dashboard' : 'Get Started'}
        </button>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="feature-card">
          <h2 className="text-2xl font-semibold mb-4 text-[#EFEFED]">How It Works</h2>
          <ol className="list-decimal list-inside text-[#9C9FA4] space-y-2">
            <li className="transition-colors duration-200 hover:text-[#EFEFED]">Upload a clear photo of your skin</li>
            <li className="transition-colors duration-200 hover:text-[#EFEFED]">Our AI analyzes your skin condition</li>
            <li className="transition-colors duration-200 hover:text-[#EFEFED]">Receive personalized skincare recommendations</li>
            <li className="transition-colors duration-200 hover:text-[#EFEFED]">Track your skin health progress over time</li>
          </ol>
        </div>
        <div className="feature-card">
          <h2 className="text-2xl font-semibold mb-4 text-[#EFEFED]">Key Features</h2>
          <ul className="space-y-2 text-[#9C9FA4]">
            <li className="flex items-center transition-colors duration-200 hover:text-[#EFEFED]">
              <span className="text-[#3B82F6] mr-2">•</span>
              Advanced AI skin analysis
            </li>
            <li className="flex items-center transition-colors duration-200 hover:text-[#EFEFED]">
              <span className="text-[#3B82F6] mr-2">•</span>
              Personalized skincare routines
            </li>
            <li className="flex items-center transition-colors duration-200 hover:text-[#EFEFED]">
              <span className="text-[#3B82F6] mr-2">•</span>
              Progress tracking and insights
            </li>
            <li className="flex items-center transition-colors duration-200 hover:text-[#EFEFED]">
              <span className="text-[#3B82F6] mr-2">•</span>
              Expert dermatologist consultations
            </li>
          </ul>
        </div>
      </section>

      {/* Dermatologists Section */}
      <section className="text-center mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-[#EFEFED]">Trusted by Dermatologists</h2>
        <p className="text-[#9C9FA4] mb-6">Our AI-powered analysis is backed by leading skin health experts.</p>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-8">
          {dermatologists.map((doctor, index) => (
            <div key={index} className="group hover-scale">
              <div className="relative w-24 h-24 mb-2">
                <Image
                  src={doctor.src}
                  alt={doctor.name}
                  fill
                  className="rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 96px) 100vw, 96px"
                  priority={index === 0}
                />
              </div>
              <p className="text-sm text-[#EFEFED] font-medium">{doctor.name}</p>
              <p className="text-xs text-[#9C9FA4]">{doctor.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="feature-card text-center">
        <h2 className="text-2xl font-semibold mb-4 text-[#EFEFED]">
          Ready to Transform Your Skincare Routine?
        </h2>
        <p className="text-[#9C9FA4] mb-6">
          Join thousands of satisfied users who have improved their skin health with DermaVision.
        </p>
        {!user && (
          <Link 
            href="/auth" 
            className="inline-block bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3 px-6 
                     rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Sign Up Now
          </Link>
        )}
      </section>
    </div>
  );
}