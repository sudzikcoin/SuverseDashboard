"use client";

import { ReactNode, useMemo, useEffect } from "react";
import { WagmiProvider, createStorage } from "wagmi";
import { useSession } from "next-auth/react";
import { disconnect } from "wagmi/actions";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import { base } from "viem/chains";
import "@rainbow-me/rainbowkit/styles.css";
import { getWalletEnv } from "@/lib/env";

function createUserStorage(userKey: string) {
  if (typeof window === "undefined") {
    return createStorage({ storage: undefined });
  }

  return createStorage({
    storage: {
      getItem: (key: string) => {
        const fullKey = `${userKey}:${key}`;
        return window.localStorage.getItem(fullKey);
      },
      setItem: (key: string, value: string) => {
        const fullKey = `${userKey}:${key}`;
        window.localStorage.setItem(fullKey, value);
      },
      removeItem: (key: string) => {
        const fullKey = `${userKey}:${key}`;
        window.localStorage.removeItem(fullKey);
      },
    },
  });
}

const queryClient = new QueryClient();

export default function UserScopedWagmiProvider({ children }: { children: ReactNode }) {
  const { data } = useSession();
  const { projectId } = getWalletEnv();
  
  const uid = (data?.user as any)?.id || data?.user?.email || "guest";
  const storageKey = useMemo(() => `suverse:wagmi:${uid}`, [uid]);

  const config = useMemo(() => {
    return getDefaultConfig({
      appName: 'SuVerse Tax Credit Dashboard',
      projectId: projectId || "demo",
      chains: [base],
      ssr: true,
      storage: createUserStorage(storageKey),
    });
  }, [storageKey, projectId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const LAST_KEY = "suverse:lastUserKey";
    const prev = window.localStorage.getItem(LAST_KEY);
    
    if (prev && prev !== storageKey) {
      disconnect(config).catch(() => {});
    }
    
    window.localStorage.setItem(LAST_KEY, storageKey);
  }, [storageKey, config]);

  return (
    <WagmiProvider config={config} key={storageKey}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({
            accentColor: '#34D399',
            accentColorForeground: '#000',
            borderRadius: 'large'
          })}
        >
          {!projectId && (
            <div style={{ 
              background: '#1e293b', 
              color: '#fbbf24', 
              padding: '12px 16px', 
              fontSize: '14px',
              borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
              textAlign: 'center'
            }}>
              ⚠️ WalletConnect projectId is missing. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in Replit Secrets and restart.
            </div>
          )}
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
