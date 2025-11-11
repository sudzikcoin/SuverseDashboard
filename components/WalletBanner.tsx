'use client';

import { useEffect, useState } from 'react';

export default function WalletBanner() {
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    const pid = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    setProjectId(pid || null);
  }, []);

  if (projectId && projectId !== "MISSING") {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-900/90 to-amber-800/90 backdrop-blur-sm border-b border-amber-600/30">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-amber-200 text-lg">⚠️</span>
          <div className="flex-1">
            <p className="text-amber-50 font-medium">
              WalletConnect is not configured
            </p>
            <p className="text-amber-200 text-xs mt-0.5">
              Set <code className="px-1.5 py-0.5 bg-black/20 rounded text-amber-100">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code> in Replit Secrets and restart. 
              Get your project ID at <span className="underline">cloud.walletconnect.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
