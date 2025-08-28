import './globals.css';
import Providers from './providers';
import GraphProviders from './graphProvider';

export const metadata = {
  title: 'Privy + Next.js App Router',
  description: 'A simple dApp with Privy and Next.js',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">  
      <body>
        <Providers>
          <GraphProviders>{children}</GraphProviders>
        </Providers>
      </body>
    </html>
  );
}