'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { ReactNode } from 'react';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base, mainnet } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

const config = getDefaultConfig({
  appName: 'SuVerse Tax Credit Dashboard',
  projectId: wcProjectId,
  chains: [base, mainnet],
  ssr: true,
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({
            accentColor: '#34D399',
            accentColorForeground: '#000',
            borderRadius: 'large'
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
