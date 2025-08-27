import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Privy + Next.js App Router',
  description: 'A simple dApp with Privy and Next.js',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">  
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}