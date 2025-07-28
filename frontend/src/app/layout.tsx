import './globals.css';
import { ReactNode } from 'react';
import ThemeToggle from '@/components/ThemeToggle'; // your client button
import Link from 'next/link';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black dark:bg-zinc-900 dark:text-white">
        <header className="bg-white dark:bg-zinc-800 shadow sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto p-4 flex gap-6 items-center">
            
            <ThemeToggle />
          </nav>
        </header>
        <main className="max-w-6xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
