'use client';

import { useEffect, useState } from 'react';

const sections = [
  { id: 'import', label: '📥 Import' },
  { id: 'overview', label: '🏢 Company Info' },
  { id: 'health', label: '💊 Financial Analsis' },
  { id: 'valuation', label: '📉 DCF Projection' },
  { id: 'eps', label: '📈 EPS  Projection' },
  { id: 'conclusion', label: '📝 Report Summary' }
];

export default function ReportTopNav({ scrollTo, showSections, onReset }) {
  const [active, setActive] = useState('import');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop - 120 <= scrollPos) {
          setActive(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="sticky top-20 z-40 bg-white dark:bg-zinc-900 border-b shadow-sm px-4 py-3">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <nav className="flex flex-wrap gap-2 text-sm font-medium">
          {sections.map((s) => (
            (s.id === 'import' || showSections) && (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`px-3 py-1 rounded-md border text-sm transition ${
                  active === s.id
                    ? 'bg-[#1DB954] text-white border-[#1DB954]'
                    : 'text-[#0073E6] border-[#0073E6] hover:bg-[#0073E6]/10'
                }`}
              >
                {s.label}
              </button>
            )
          ))}
        </nav>

        <button
          onClick={onReset}
          className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          🔄 Reset Report
        </button>
      </div>
    </div>
  );
}
