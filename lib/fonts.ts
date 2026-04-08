import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});
