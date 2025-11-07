'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const USDC = (process.env.NEXT_PUBLIC_USDC_BASE || '0x833589fCD6eDb6E08f4c7C36aF6aBf4aC5fE0e52') as `0x${string}`;

const erc20Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

export function WalletConnectBar() {
  const { address, chain } = useAccount();
  const [usdc, setUsdc] = useState<string>('');

  useEffect(() => {
    if (!address) {
      setUsdc('');
      return;
    }

    const client = createPublicClient({ chain: base, transport: http() });
    
    (async () => {
      try {
        const bal = await client.readContract({
          address: USDC,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address as `0x${string}`]
        });
        setUsdc(Number(formatUnits(bal as bigint, 6)).toLocaleString('en-US'));
      } catch {
        setUsdc('');
      }
    })();
  }, [address]);

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4 glass">
      <ConnectButton chainStatus="icon" showBalance={false} />
      <div className="text-sm text-white/80">
        {address ? (
          <div className="space-y-1">
            <div className="truncate max-w-xs">
              <span className="text-white/60">Address:</span> {address.slice(0, 6)}...{address.slice(-4)}
            </div>
            <div>
              <span className="text-white/60">Chain:</span> {chain?.name ?? '—'}
            </div>
            <div>
              <span className="text-white/60">USDC Balance:</span>{' '}
              <span className="font-mono text-su-emerald">{usdc || '—'}</span>
            </div>
          </div>
        ) : (
          <div className="text-white/60">Connect a wallet to view USDC balance</div>
        )}
      </div>
    </div>
  );
}
