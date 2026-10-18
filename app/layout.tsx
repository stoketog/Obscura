import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Obscura — How obscure can you get?',
  description: 'A daily game about the obscure. Seven prompts, thirty seconds each: the rarer your answers, the higher you rise.',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'Obscura',
    description: 'How obscure can you get? Seven prompts a day, and the rarer your answers the higher you rise.',
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
      <body>{children}</body>
    </html>
  );
}
