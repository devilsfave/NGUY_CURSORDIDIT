import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DermaVision',
  description: 'AI-powered skin health analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}