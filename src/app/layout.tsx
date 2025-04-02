import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for the Header component
// as it depends on client-side AuthContext
const Header = dynamic(() => import('@/components/Header'), { ssr: false });
const AnnouncementBanner = dynamic(() => import('@/components/AnnouncementBanner'), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crypto Trading Panel",
  description: "Real-time cryptocurrency trading panel with live price updates",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AnnouncementBanner />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
