import './globals.css';
import { ReactNode } from 'react';
import TopNav from '@/components/ui/TopNav'; // 👈 Add this


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black dark:bg-zinc-900 dark:text-white font-inter">
        {/* Sticky TopNav with zero margin */}
        <header className="sticky top-0 z-50">
          <TopNav />
        </header>

        {/* Page Content: children includes ReportTopNav + ReportPage */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          {children}
        </main>
      </body>
    </html>
  );
}
