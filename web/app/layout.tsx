import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Terminal Tutor',
  description: 'Gamified, story-driven CLI trainer that runs in your browser.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0a0a0f', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
