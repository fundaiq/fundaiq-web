import './globals.css';
import { ReactNode } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import TopNav from '@/components/ui/TopNav'; // 👈 Add this

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black dark:bg-zinc-900 dark:text-white font-inter">
        <header className="bg-white dark:bg-zinc-800 shadow sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
            <TopNav />
            
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
