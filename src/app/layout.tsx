import React from 'react';
import Link from 'next/link';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import ClientNavigation from '../components/Navigation/ClientNavigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-[#0D111D] to-[#171B26] text-[#EFEFED] min-h-screen flex flex-col">
        <AuthProvider>
          <header className="p-4 border-b border-[#262A36]">
            <ClientNavigation />
          </header>
          <main className="container mx-auto p-4 flex-grow">
            {children}
          </main>
          <footer className="bg-[#171B26] text-[#EFEFED] p-4 mt-8">
            <div className="container mx-auto flex justify-between items-center">
              <div>
                <p>&copy; 2024 DermaVision. All rights reserved.</p>
              </div>
              <div>
                <ul className="flex space-x-4">
                  <li>
                    <Link href="/about" className="hover:text-[#3B82F6] transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-[#3B82F6] transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-[#3B82F6] transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-[#3B82F6] transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}