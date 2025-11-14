'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect } from 'react';
import { getWalletEnv } from '@/lib/env';

interface WalletConnectButtonProps {
  className?: string;
}

export default function WalletConnectButton({ className = '' }: WalletConnectButtonProps) {
  const walletEnv = getWalletEnv();

  useEffect(() => {
    const patchButtonLabels = () => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach((btn) => {
        if (btn.textContent?.match(/Подключить кошел(е|ё)к/i)) {
          btn.textContent = 'Connect Wallet';
        }
      });
    };

    patchButtonLabels();

    const observer = new MutationObserver(patchButtonLabels);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  // Check if projectId is valid (32 hex chars)
  if (!walletEnv.isValid || !walletEnv.projectId) {
    return (
      <div className={className}>
        <button
          type="button"
          disabled
          title="WalletConnect is not configured"
          className="rounded-full px-4 py-2 border border-gray-500/40 bg-gray-700/30 backdrop-blur-sm text-gray-400 font-medium cursor-not-allowed opacity-60"
        >
          Connect Wallet (disabled)
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          if (!connected) {
            return (
              <button
                onClick={openConnectModal}
                type="button"
                className="rounded-full px-4 py-2 border border-emerald-400/40 hover:border-emerald-400/70 bg-transparent backdrop-blur-sm transition text-gray-100 font-medium"
              >
                Connect Wallet
              </button>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <button
                onClick={openChainModal}
                type="button"
                className="flex items-center gap-2 rounded-full px-3 py-2 border border-white/10 hover:border-emerald-400/40 bg-slate-900/60 backdrop-blur-sm transition"
              >
                {chain.hasIcon && chain.iconUrl && (
                  <img
                    alt={chain.name ?? 'Chain icon'}
                    src={chain.iconUrl}
                    className="w-4 h-4"
                  />
                )}
                <span className="text-gray-200 text-sm">{chain.name}</span>
              </button>

              <button
                onClick={openAccountModal}
                type="button"
                className="flex items-center gap-2 rounded-full px-3 py-2 border border-white/10 hover:border-emerald-400/40 bg-slate-900/60 backdrop-blur-sm transition"
              >
                <span className="text-gray-200 text-sm">{account.displayName}</span>
              </button>
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}
