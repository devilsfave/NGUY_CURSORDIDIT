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
          <header className="p-4 border-b border-[#262A36] sticky top-0 z-10 bg-[#0D111D] bg-opacity-90 backdrop-filter backdrop-blur-lg">
            <ClientNavigation />
          </header>
          <main className="container mx-auto p-4 flex-grow fade-in">
            {children}
          </main>
          <footer className="bg-[#171B26] text-[#EFEFED] p-4 mt-8">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p>&copy; 2024 DermaVision. All rights reserved.</p>
              </div>
              <div>
                <ul className="flex flex-wrap justify-center md:justify-end space-x-4">
                  <li className="mb-2 md:mb-0">
                    <Link href="/about" className="hover:text-[#3B82F6] transition-colors">
                      About
                    </Link>
                  </li>
                  <li className="mb-2 md:mb-0">
                    <Link href="/app/Privacy Policy/privacy-policy" className="hover:text-[#3B82F6] transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li className="mb-2 md:mb-0">
                    <Link href="/app/Terms of Service/terms-of-service" className="hover:text-[#3B82F6] transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li className="mb-2 md:mb-0">
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
