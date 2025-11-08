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
    <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 glass shadow-lg">
      <ConnectButton chainStatus="icon" showBalance={false} />
      <div className="text-sm text-gray-100">
        {address ? (
          <div className="space-y-1">
            <div className="truncate max-w-xs">
              <span className="text-gray-200">Address:</span> <span className="text-gray-100">{address.slice(0, 6)}...{address.slice(-4)}</span>
            </div>
            <div>
              <span className="text-gray-200">Chain:</span> <span className="text-gray-100">{chain?.name ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-200">USDC Balance:</span>{' '}
              <span className="font-mono text-su-emerald">{usdc || '—'}</span>
            </div>
          </div>
        ) : (
          <div className="text-gray-200">Connect a wallet to view USDC balance</div>
        )}
      </div>
    </div>
  );
}
