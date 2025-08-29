import { Orbitron } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-orbitron', // CSS Variable for easy use
});

import Providers from './providers';
import GraphProviders from './graphProvider';

export const metadata = {
  title: 'Privy + Next.js App Router',
  description: 'A simple dApp with Privy and Next.js',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">  
      <body className ={`${orbitron.variable} font-sans `}>
        <Providers>
          <GraphProviders>{children}</GraphProviders>
        </Providers>
      </body>
    </html>
  );
}