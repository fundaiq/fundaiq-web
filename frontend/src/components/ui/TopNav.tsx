'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';

export default function TopNav() {
  const pathname = usePathname();

  const linkClasses = (path: string) =>
    `text-sm font-medium px-3 py-1 rounded-md border transition whitespace-nowrap ${
      pathname === path
        ? 'bg-[#0073E6] border-[#0073E6] text-white'
        : 'border-white text-white hover:bg-white hover:text-[#1F1F1F]'
    }`;

  return (
    <div className="bg-[#1F1F1F] text-white px-2 sm:px-4 py-2 shadow-sm w-full">
      <div className="max-w-6xl mx-auto flex overflow-x-auto items-center gap-4 whitespace-nowrap scrollbar-hide">
        {/* Logo + Brand Name */}
        <div className="flex items-center gap-2 shrink-0">
          <Image src="/icon.png" alt="FundaIQ Logo" width={34} height={34} />
          <span className="text-lg font-bold tracking-wide font-montserrat">
            Funda<span className="text-[#0073E6]">IQ</span>
          </span>
        </div>

        {/* Page Links */}
        <div className="flex gap-2 shrink-0">
          <Link href="/" className={linkClasses('/')}>Home</Link>
          <Link href="/report" className={linkClasses('/report')}>Create Reports</Link>
          <Link href="/learn" className={linkClasses('/learn')}>Learn</Link>
        </div>

        {/* Theme Toggle aligned right */}
        <div className="ml-auto shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
