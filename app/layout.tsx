import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Obscura — How obscure can you get?',
  description: 'One mystery. One day. One chance to evolve. A daily guessing game about the obscure.',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'Obscura',
    description: 'One mystery. One day. One chance to evolve.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#030b14',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
