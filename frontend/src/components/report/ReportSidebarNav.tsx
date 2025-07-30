'use client';

import { useEffect, useState } from 'react';

const sections = [
  { id: 'import', label: '📥 Import' },
  { id: 'overview', label: '🏢 Info' },
  { id: 'health', label: '💊 Health' },
  { id: 'valuation', label: '📉 DCF' },
  { id: 'eps', label: '📈 EPS' },
  { id: 'conclusion', label: '📝 Summary' }
];

export default function ReportSidebarNav({ scrollTo, showSections, offsetTop = 144 }) {
  const [active, setActive] = useState('import');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop - 100 <= scrollPos) {
          setActive(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <aside className="fixed left-4 z-40 hidden md:flex flex-col gap-3 p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-md"
       style={{ top: offsetTop }}>
      {sections.map(
        (s) =>
          (s.id === 'import' || showSections) && (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`text-sm px-3 py-1 rounded-full transition font-medium whitespace-nowrap ${
                active === s.id
                  ? 'bg-[#0073E6] text-white'
                  : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {s.label}
            </button>
          )
      )}
    </aside>
  );
}
