import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Obscura — How obscure can you get?',
  description: 'One photograph. Seven prompts. One guess. A daily game about the obscure: the rarer your answers, the more light gets in.',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'Obscura',
    description: 'One photograph. Seven prompts. One guess. The rarer your answers, the more of the photograph you see.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d0b09',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
