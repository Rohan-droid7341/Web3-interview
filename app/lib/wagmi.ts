import {createConfig} from '@privy-io/wagmi';

import {mainnet, sepolia} from 'viem/chains';
import {http} from 'wagmi';


export const config = createConfig({
  chains: [mainnet, sepolia], // Pass your required chains as an array
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    // For each of your required chains, add an entry to `transports` with
    // a key of the chain's `id` and a value of `http()`
  },
});