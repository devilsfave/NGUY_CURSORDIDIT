import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-[#171B26] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-[#EFEFED]">
          DermaVision
        </Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-[#EFEFED] hover:text-[#3B82F6]">
                Dashboard
              </Link>
              <Link href="/analysis" className="text-[#EFEFED] hover:text-[#3B82F6]">
                New Analysis
              </Link>
              <Link href="/education" className="text-[#EFEFED] hover:text-[#3B82F6]">
                Education
              </Link>
              <Link href="/profile" className="text-[#EFEFED] hover:text-[#3B82F6]">
                Profile
              </Link>
              {user.email === 'herbertyeboah123@gmail.com' && (
                <Link href="/admin" className="text-[#EFEFED] hover:text-[#3B82F6]">
                  Admin
                </Link>
              )}
            </>
          ) : (
            <Link href="/auth" className="text-[#EFEFED] hover:text-[#3B82F6]">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;