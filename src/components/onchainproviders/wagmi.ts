import { http, createConfig } from 'wagmi';
import { base, mainnet, zora, gnosis, polygon, arbitrum, optimism, avalanche } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
 
export const wagmiConfig = createConfig({
  chains: [base, mainnet, zora, gnosis, polygon, arbitrum, optimism, avalanche],
  multiInjectedProviderDiscovery: false,
  connectors: [
    coinbaseWallet({
      appName: 'tike-social',
      preference: 'all',
      version: '4',
    }),
  ],
  ssr: true,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [zora.id]: http(),
    [gnosis.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [avalanche.id]: http(),
  },
});
