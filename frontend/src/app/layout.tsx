// app/layout.tsx
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Analytics } from "@vercel/analytics/react";
import TopNav from '@/components/ui/TopNav';
import MobileBottomSearch from '@/components/ui/MobileBottomSearch';
import SessionBootstrap from '@/components/auth/SessionBootstrap';
import { ThemeProvider } from '@/components/ThemeProvider';
import { 
  SEBIComplianceNotice, 
  ScrollToTopButton, 
  GlobalLoadingIndicator,
  GlobalScripts 
} from '@/components/LayoutClientElements';

import '@/styles/globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://funda-iq.com';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  title: {
    default: 'Funda-IQ | Educational Stock Analysis & Valuation Tools',
    template: '%s | Funda-IQ'
  },
  description: 'Professional stock valuation and analysis tools for Indian retail investors. Educational DCF models, EPS projections, and portfolio analytics.',
  openGraph: {
    title: 'Funda-IQ | Educational Stock Analysis & Valuation Tools',
    description: 'Professional stock valuation and analysis made simple with DCF models, EPS projections and portfolio analytics for Indian retail investors.',
    url: SITE_URL,
    siteName: 'Funda-IQ',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Funda-IQ' }],
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Funda-IQ | Educational Investment Analysis',
    description: 'Stock valuation & analysis made simple with DCF, EPS and portfolio analytics.',
    images: [OG_IMAGE],
    creator: '@fundaiq',
    site: '@fundaiq',
  },
  robots: { index: true, follow: true },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

interface RootLayoutProps { children: ReactNode; }

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/Inter-Variable.woff2" as="font" type="font/woff2" crossOrigin="" />
        <meta name="theme-color" content="var(--surface-primary)" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>

      <body className="antialiased bg-surface-primary text-primary">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SessionBootstrap />

          <div className="min-h-screen flex flex-col">
            {/* TopNav handles its own positioning */}
            <TopNav />

            <main className="flex-1">
              {/* Add top padding to account for fixed nav */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20">
                {children}
              </div>
            </main>

            <div className="md:hidden">
              <MobileBottomSearch />
            </div>
          </div>

          <SEBIComplianceNotice />
          <GlobalLoadingIndicator />
          <ScrollToTopButton />
          <GlobalScripts />
        </ThemeProvider>
      </body>
    </html>
  );
}