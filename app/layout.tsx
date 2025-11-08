import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import Providers from "./providers";
import Splash from "@/components/Splash";
import "./globals.css";

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
        <Providers>
          <SessionProvider>{children}</SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
