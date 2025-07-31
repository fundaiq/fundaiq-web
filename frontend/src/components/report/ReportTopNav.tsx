'use client';

import { useEffect, useRef, useState } from 'react';
import Disclaimer from '@/components/Disclaimer';

const sections = [
  { id: 'import', label: 'Import' },
  { id: 'overview', label: 'Company Info' },
  { id: 'health', label: 'Financial Analysis' },
  { id: 'valuation', label: 'DCF Projection' },
  { id: 'eps', label: 'EPS Projection' },
  { id: 'conclusion', label: 'Report Summary' }
];

export default function ReportTopNav({ scrollTo, showSections, onReset }) {
  const [active, setActive] = useState('import');
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    const hidden = localStorage.getItem('hideDisclaimer');
    if (hidden === 'true') setShowDisclaimer(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop - 120 <= scrollPos) {
          setActive(sections[i].id);
          const btn = buttonRefs.current[sections[i].id];
          if (btn) {
            btn.scrollIntoView({
              behavior: 'smooth',
              inline: 'center',
              block: 'nearest'
            });
          }
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dismissDisclaimer = () => {
    setShowDisclaimer(false);
    localStorage.setItem('hideDisclaimer', 'true');
  };

  return (
    <div className="sticky top-[40px] z-40 bg-white dark:bg-zinc-900 border-b shadow-sm px-4 py-3">
      
      {/* Scrollable nav with fade + snap */}
      <div className="relative max-w-6xl mx-auto">
        <div className="flex gap-2 overflow-x-auto scroll-snap-x scroll-smooth whitespace-nowrap scrollbar-hide pr-4">
          {sections.map(
            (s) =>
              (s.id === 'import' || showSections) && (
                <button
                  key={s.id}
                  ref={(el) => (buttonRefs.current[s.id] = el)}
                  onClick={() => scrollTo(s.id)}
                  className={`px-3 py-1 rounded-md border text-sm transition whitespace-nowrap shrink-0 scroll-snap-align-center ${
                    active === s.id
                      ? 'bg-[#1DB954] text-white border-[#1DB954] animate-highlight'
                      : 'text-[#0073E6] border-[#0073E6] hover:bg-[#0073E6]/10'
                  }`}
                >
                  {s.label}
                </button>
              )
          )}

          <button
            onClick={onReset}
            className="shrink-0 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Reset Report
          </button>
        </div>

        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white dark:from-zinc-900 pointer-events-none" />
      </div>
    </div>
  );
}
