'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';
import { AlertCircle, Wallet, CheckCircle2, XCircle } from 'lucide-react';

interface CompanyWalletButtonProps {
  companyName: string;
  companyWalletAddress: string | null;
  className?: string;
}

/**
 * Company-specific wallet button with safety logic to prevent wallet leakage between companies.
 * 
 * Safety Rules:
 * - If company has NO linked wallet -> auto-disconnect any browser wallet
 * - If company HAS linked wallet && connected wallet != linked wallet -> show mismatch warning
 * - If company HAS linked wallet && connected wallet == linked wallet -> show connected state
 */
export default function CompanyWalletButton({ 
  companyName, 
  companyWalletAddress, 
  className = '' 
}: CompanyWalletButtonProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showMismatchBanner, setShowMismatchBanner] = useState(false);

  // Normalize addresses for comparison
  const normalizedCompanyWallet = companyWalletAddress ? companyWalletAddress.toLowerCase() : null;
  const normalizedConnected = address ? address.toLowerCase() : null;

  // Helper flags
  const hasLinkedWallet = !!normalizedCompanyWallet;
  const hasConnectedWallet = isConnected && !!normalizedConnected;

  const isSameWallet =
    hasLinkedWallet &&
    hasConnectedWallet &&
    normalizedCompanyWallet === normalizedConnected;

  const hasMismatch =
    hasLinkedWallet &&
    hasConnectedWallet &&
    !isSameWallet;

  // TODO: This auto-disconnect is for company dashboards only, to avoid leaking wallet from another company on the same device.
  useEffect(() => {
    // If the company does NOT have a linked wallet in DB,
    // but there is a wallet connected in the browser,
    // disconnect it so a new company never starts with someone else's wallet.
    if (!companyWalletAddress && isConnected) {
      console.log('[CompanyWallet] Auto-disconnecting wallet - company has no linked wallet');
      disconnect();
      return;
    }
    
    // Show mismatch banner if connected wallet doesn't match company's linked wallet
    if (hasMismatch) {
      setShowMismatchBanner(true);
    } else {
      setShowMismatchBanner(false);
    }
  }, [companyWalletAddress, isConnected, disconnect, hasMismatch]);

  const shortAddress = (addr: string) => {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  };

  // TODO: call backend to save address as company.walletAddress when linking the wallet for this company.
  const handleLinkWallet = async (walletAddress: string) => {
    console.log('[CompanyWallet] TODO: Link wallet to company:', walletAddress);
    try {
      const res = await fetch('/api/company/link-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to link wallet');
      }
      
      // Refresh page to update company data
      window.location.reload();
    } catch (error) {
      console.error('[CompanyWallet] Error linking wallet:', error);
      alert('Failed to link wallet. Please try again.');
    }
  };

  // TODO: implement endpoint to relink company wallet to the currently connected address (with confirmation & audit).
  const handleRelinkWallet = async () => {
    if (!address) return;
    
    const confirmed = confirm(
      `Are you sure you want to change the linked wallet for ${companyName} from ${shortAddress(companyWalletAddress!)} to ${shortAddress(address)}?`
    );
    
    if (confirmed) {
      await handleLinkWallet(address);
    }
  };

  return (
    <div className={className}>
      {/* Mismatch Warning Banner */}
      {showMismatchBanner && hasMismatch && (
        <div className="absolute top-16 left-4 right-4 md:left-8 md:right-8 z-50 glass border-red-500/30 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-400 mb-1">
                Wallet Mismatch
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                This company is linked to wallet <span className="font-mono text-emerald-400">{shortAddress(companyWalletAddress!)}</span>, 
                but your browser is currently connected as <span className="font-mono text-yellow-400">{shortAddress(address!)}</span>. 
                Please switch to the linked wallet in your wallet app or disconnect and link a new wallet for this company.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => disconnect()}
                  className="px-3 py-1.5 text-xs rounded-lg border border-red-400/40 hover:border-red-400/70 bg-transparent backdrop-blur-sm transition text-red-400"
                >
                  Disconnect Wallet
                </button>
                <button
                  onClick={handleRelinkWallet}
                  className="px-3 py-1.5 text-xs rounded-lg border border-yellow-400/40 hover:border-yellow-400/70 bg-transparent backdrop-blur-sm transition text-yellow-400"
                >
                  Use Current Wallet Instead
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowMismatchBanner(false)}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          // STATE A: No linked wallet (new company)
          if (!hasLinkedWallet) {
            if (!connected) {
              return (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-full px-3 py-2 border border-yellow-400/30 bg-yellow-400/5 backdrop-blur-sm">
                    <Wallet className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">Wallet not linked</span>
                  </div>
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="rounded-full px-4 py-2 border border-emerald-400/40 hover:border-emerald-400/70 bg-transparent backdrop-blur-sm transition text-gray-100 font-medium"
                  >
                    Connect to Link
                  </button>
                </div>
              );
            } else {
              // Just connected, show option to link
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

                  <button
                    onClick={() => handleLinkWallet(account.address)}
                    className="rounded-full px-4 py-2 border border-emerald-400/40 hover:border-emerald-400/70 bg-emerald-500/10 backdrop-blur-sm transition text-emerald-400 font-medium"
                  >
                    Link This Wallet
                  </button>
                </div>
              );
            }
          }

          // STATE B: Linked wallet matches connected wallet
          if (isSameWallet && connected) {
            return (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full px-3 py-2 border border-emerald-400/30 bg-emerald-400/5 backdrop-blur-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-medium">Linked Wallet</span>
                </div>

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
          }

          // STATE C: Company has linked wallet but not connected / mismatch
          // Show the linked wallet info and connect button
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full px-3 py-2 border border-emerald-400/30 bg-emerald-400/5 backdrop-blur-sm">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">
                  Linked: {shortAddress(companyWalletAddress!)}
                </span>
              </div>
              
              <button
                onClick={openConnectModal}
                type="button"
                className="rounded-full px-4 py-2 border border-emerald-400/40 hover:border-emerald-400/70 bg-transparent backdrop-blur-sm transition text-gray-100 font-medium"
              >
                Connect Wallet
              </button>
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}
