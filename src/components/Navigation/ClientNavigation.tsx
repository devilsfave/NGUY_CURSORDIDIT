'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

const ClientNavigation: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="container mx-auto flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-[#EFEFED]">
        DermaVision
      </Link>
      <ul className="flex space-x-4">
        {user ? (
          <>
            <li>
              <Link href="/dashboard" className="hover:text-[#3B82F6] transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/analysis" className="hover:text-[#3B82F6] transition-colors">
                New Analysis
              </Link>
            </li>
            <li>
              <Link href="/appointments" className="hover:text-[#3B82F6] transition-colors">
                Appointments
              </Link>
            </li>
            <li>
              <Link href="/education" className="hover:text-[#3B82F6] transition-colors">
                Education
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-[#3B82F6] transition-colors">
                Profile
              </Link>
            </li>
            {user.email === 'herbertyeboah123@gmail.com' && (
              <li>
                <Link href="/admin" className="hover:text-[#3B82F6] transition-colors">
                  Admin Panel
                </Link>
              </li>
            )}
          </>
        ) : (
          <li>
            <Link href="/auth" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded transition-colors">
              Sign In
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default ClientNavigation;