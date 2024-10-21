import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

const Navigation: React.FC = () => {
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
        <div className={`md:flex md:space-x-4 ${isMenuOpen ? 'block' : 'hidden'} absolute md:relative top-16 md:top-0 left-0 md:left-auto w-full md:w-auto bg-[#171B26] md:bg-transparent p-4 md:p-0`}>
          {user ? (
            <>
              <Link href="/dashboard" className="block md:inline-block text-[#EFEFED] hover:text-[#3B82F6] mb-2 md:mb-0">
                Dashboard
              </Link>
              <Link href="/analysis" className="block md:inline-block text-[#EFEFED] hover:text-[#3B82F6] mb-2 md:mb-0">
                New Analysis
              </Link>
              <Link href="/education" className="block md:inline-block text-[#EFEFED] hover:text-[#3B82F6] mb-2 md:mb-0">
                Education
              </Link>
              <Link href="/profile" className="block md:inline-block text-[#EFEFED] hover:text-[#3B82F6] mb-2 md:mb-0">
                Profile
              </Link>
              {user.email === 'herbertyeboah123@gmail.com' && (
                <Link href="/admin" className="block md:inline-block text-[#EFEFED] hover:text-[#3B82F6] mb-2 md:mb-0">
                  Admin
                </Link>
              )}
            </>
          ) : (
            <Link href="/auth" className="block md:inline-block text-[#EFEFED] hover:text-[#3B82F6]">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;