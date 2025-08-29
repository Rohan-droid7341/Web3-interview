'use client';

import {PrivyProvider} from '@privy-io/react-auth';
import {sepolia} from '@privy-io/chains';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {WagmiProvider} from '@privy-io/wagmi';
import {config} from './lib/wagmi';

const queryClient = new QueryClient();

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{

        defaultChain: sepolia,
        supportedChains: [sepolia],

        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        embeddedWallets: {
          createOnLogin: 'all-users',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config = {config}>{children}</WagmiProvider>
        </QueryClientProvider>
      
    </PrivyProvider>
  );
}