'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

interface WalletConnectButtonProps {
  className?: string;
}

export default function WalletConnectButton({ className = '' }: WalletConnectButtonProps) {
  return (
    <div className={className}>
      <ConnectButton 
        chainStatus="icon" 
        showBalance={false}
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }}
      />
    </div>
  );
}
