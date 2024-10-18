import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'DermaVision | AI-Powered Skin Health',
    template: '%s | DermaVision'
  },
  description: 'Revolutionary AI-powered skin analysis and personalized dermatology assistance',
  keywords: ['skin health', 'AI', 'dermatology', 'skin analysis'],
  authors: [{ name: 'DermaVision Team' }],
  creator: 'DermaVision',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0D111D' },
    { media: '(prefers-color-scheme: dark)', color: '#0D111D' },
  ],
};