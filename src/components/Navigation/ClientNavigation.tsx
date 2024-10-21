'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

const ClientNavigation: React.FC = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-[#171B26] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-[#EFEFED]">
          DermaVision
        </Link>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-[#EFEFED] focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        <ul className={`md:flex md:space-x-4 ${isMenuOpen ? 'block' : 'hidden'} absolute md:relative top-16 md:top-0 left-0 md:left-auto w-full md:w-auto bg-[#171B26] md:bg-transparent p-4 md:p-0`}>
          {user ? (
            <>
              <li>
                <Link href="/dashboard" className="block md:inline-block text-[#EFEFED] hover:text-[#3B82F6] mb-2 md:mb-0">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/analysis" className="block md:inline-block text-[#EFEFED] hover:text-[#3B82F6] mb-2 md:mb-0">
                  New Analysis
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="block md:inline-block text-[#EFEFED] hover:text-[#3B82F6] mb-2 md:mb-0">
                  Appointments
                </Link>
              </li>
              <li>
                <Link href="/education" className="block md:inline-block text-[#EFEFED] hover:text-[#3B82F6] mb-2 md:mb-0">
                  Education
                </Link>
              </li>
              <li>
                <Link href="/profile" className="block md:inline-block text-[#EFEFED] hover:text-[#3B82F6] mb-2 md:mb-0">
                  Profile
                </Link>
              </li>
              {user.email === 'herbertyeboah123@gmail.com' && (
                <li>
                  <Link href="/admin" className="block md:inline-block text-[#EFEFED] hover:text-[#3B82F6] mb-2 md:mb-0">
                    Admin Panel
                  </Link>
                </li>
              )}
            </>
          ) : (
            <li>
              <Link href="/auth" className="block md:inline-block bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded transition-colors">
                Sign In
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default ClientNavigation;