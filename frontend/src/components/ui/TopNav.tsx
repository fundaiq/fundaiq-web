'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';

export default function TopNav() {
  const pathname = usePathname();

  const linkClasses = (path: string) =>
    `text-sm font-medium px-4 py-2 rounded-md border transition ${
      pathname === path
        ? 'bg-[#0073E6] border-[#0073E6] text-white'
        : 'border-white text-white hover:bg-white hover:text-[#1F1F1F]'
    }`;

  return (
    <div className="bg-[#1F1F1F] text-white px-6 py-1 shadow-sm w-full">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left side: Logo + brand + tabs */}
        <div className="flex items-center gap-6">
          {/* Logo + Text */}
          <div className="flex items-center gap-0">
            <Image src="/icon.png" alt="FundaIQ Logo" width={45} height={45} />
            <span className="text-lg font-bold tracking-wide font-montserrat">
              Funda<span className="text-[#0073E6] font-bold ">IQ</span>
            </span>
          </div>

          {/* Nav Links */}
          <div className="flex gap-3 ml-6">
            <Link href="/" className={linkClasses('/')}>🏠 Home</Link>
            <Link href="/report" className={linkClasses('/report')}>📝 Create Reports</Link>
            <Link href="/learn" className={linkClasses('/learn')}>📚 Learn</Link>
          </div>
        </div>

        {/* Right side: Theme Toggle */}
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
