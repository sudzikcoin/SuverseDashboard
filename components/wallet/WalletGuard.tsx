"use client";

import { useAccount, useConfig } from "wagmi";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { disconnect } from "wagmi/actions";

export default function WalletGuard() {
  const { isConnected } = useAccount();
  const { data } = useSession();
  const uid = (data?.user as any)?.id || data?.user?.email || "guest";
  const config = useConfig();

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const expectedKey = `suverse:wagmi:${uid}`;
    const actualKey = window.localStorage.getItem("suverse:lastUserKey");
    
    if (isConnected && actualKey && actualKey !== expectedKey) {
      console.warn("Wallet belongs to different user, disconnecting");
      disconnect(config).catch(() => {});
    }
  }, [uid, isConnected, config]);

  return null;
}
