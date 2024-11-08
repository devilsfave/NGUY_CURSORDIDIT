'use client';

import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import ErrorFallback from '../components/common/ErrorFallback';
import { handleError } from '../utils/errorHandler';
import { AuthProvider } from '../contexts/AuthContext';
import { AppointmentProvider } from '../contexts/AppointmentContext'; // Added AppointmentProvider import
import ClientNavigation from '../components/Navigation/ClientNavigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

// Create a wrapper component for client-side only features
const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => handleError(error, 'application error', {
        silent: false,
        retry: true,
        additionalInfo: info.componentStack || 'Unknown component stack'
      })}
      onReset={() => window.location.reload()}
    >
      <AuthProvider>
        <AppointmentProvider> {/* Added AppointmentProvider */}
          <header className="p-4 border-b border-[#262A36] sticky top-0 z-10 bg-[#0D111D] bg-opacity-90 backdrop-filter backdrop-blur-lg">
            <ClientNavigation />
          </header>
          <main className="container mx-auto p-4 flex-grow fade-in">
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
          </main>
          <ToastContainer />
        </AppointmentProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-[#0D111D] to-[#171B26] text-[#EFEFED] min-h-screen flex flex-col">
        <ClientWrapper>
          {children}
        </ClientWrapper>
        <footer className="bg-[#171B26] text-[#EFEFED] p-4 mt-8">
          <div className="container mx-auto text-center">
            <p className="text-sm text-[#9C9FA4]">
              © {new Date().getFullYear()} DermaVision. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}