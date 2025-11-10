"use client";

import { signOut } from "next-auth/react";
import { useConfig } from "wagmi";
import { disconnect } from "wagmi/actions";

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function SignOutButton({ className, children }: SignOutButtonProps) {
  const config = useConfig();

  const handleSignOut = async () => {
    try {
      await disconnect(config);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
    
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button onClick={handleSignOut} className={className}>
      {children || "Sign Out"}
    </button>
  );
}
