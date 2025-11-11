import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import UserScopedWagmiProvider from "./providers/UserScopedWagmiProvider";
import ClientInit from "@/components/ClientInit";
import WalletGuard from "@/components/wallet/WalletGuard";
import WalletBanner from "@/components/WalletBanner";
import Splash from "@/components/Splash";
import { GlobalErrorBoundary } from "@/components/ops/GlobalErrorBoundary";
import { ReleaseChecklist } from "@/components/ops/ReleaseChecklist";
import { ShieldToastSetup } from "@/components/ops/ShieldToastSetup";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

export const metadata: Metadata = {
  title: "SuVerse Tax Credit Dashboard",
  description: "Discover, reserve, and purchase transferable tax credits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0B1220] text-gray-100">
        <Splash />
        <SessionProvider>
          <ClientInit />
          <UserScopedWagmiProvider>
            <GlobalErrorBoundary>
              <ShieldToastSetup />
              <WalletBanner />
              <WalletGuard />
              {children}
              <ReleaseChecklist />
            </GlobalErrorBoundary>
          </UserScopedWagmiProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
