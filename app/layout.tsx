import type { Metadata } from 'next';
import { inter, jetbrainsMono, playfair } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Legal Document Analyzer',
  description: 'Professional-grade contract analysis and risk detection.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable}`}>
      <body className="bg-[#F8F9FA] text-[#1A1A1A] antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
