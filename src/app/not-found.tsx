import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4 text-[#EFEFED]">404 - Page Not Found</h1>
      <p className="text-xl mb-8 text-[#9C9FA4]">Oops! The page you're looking for doesn't exist.</p>
      <Link 
        href="/" 
        className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
      >
        Go Back Home
      </Link>
    </div>
  );
}