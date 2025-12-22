import type { Metadata, Viewport } from "next";
import SessionProvider from "@/components/SessionProvider";
import UserScopedWagmiProvider from "./providers/UserScopedWagmiProvider";
import ClientInit from "@/components/ClientInit";
import WalletGuard from "@/components/wallet/WalletGuard";
import WalletBanner from "@/components/WalletBanner";
import Splash from "@/components/Splash";
import ConsoleFilter from "@/components/ConsoleFilter";
import PwaInit from "@/components/PwaInit";
import { GlobalErrorBoundary } from "@/components/ops/GlobalErrorBoundary";
import { ReleaseChecklist } from "@/components/ops/ReleaseChecklist";
import { ShieldToastSetup } from "@/components/ops/ShieldToastSetup";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

export const metadata: Metadata = {
  title: "SuVerse Tax Credit Dashboard",
  description: "Discover, reserve, and purchase transferable tax credits",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SuVerse",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <PwaInit />
        <SessionProvider>
          <ClientInit />
          <ConsoleFilter />
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
