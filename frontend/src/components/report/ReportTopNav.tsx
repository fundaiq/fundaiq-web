'use client';

import { useEffect, useRef, useState } from 'react';

const sections = [
  { id: 'pricechart', label: 'Price Chart', icon: '📈' },
  { id: 'stockmetrics', label: 'Key Metrics', icon: '📊' },
  { id: 'health', label: 'Financial Health', icon: '💊' },
  { id: 'valuation', label: 'Valuation Output', icon: '🎯' },
  { id: 'assumptions', label: 'Valuation Assumptions', icon: '⚙️' },
  { id: 'dcf', label: 'DCF Projection', icon: '🔮' },
  { id: 'eps', label: 'EPS Projection', icon: '💰' },
  { id: 'info', label: 'Company Info', icon: '🏢' },
];

interface ReportTopNavProps {
  scrollTo: (sectionId: string) => void;
  showSections: boolean;
  onReset: () => void;
}

export default function ReportTopNav({ scrollTo, showSections, onReset }: ReportTopNavProps) {
  const [active, setActive] = useState('import');
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120; // Account for nav height
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActive(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="reportTopNavContainer">
      <div className="reportTopNavContent">
        <div className="px-4 py-3">
          <div 
            ref={navRef}
            className="flex gap-2 overflow-x-auto scroll-smooth pb-1"
          >
            <div className="flex gap-2 min-w-max">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={`nav-button ${
                    active === section.id ? 'active' : ''
                  }`}
                >
                  <span className="nav-button-icon">
                    {section.icon}
                  </span>
                  <span className="nav-button-text">
                    {section.label}
                  </span>
                </button>
              ))}

              <button
                onClick={onReset}
                className="reset-button"
                title="Reset Report"
              >
                <span className="reset-button-icon">🔄</span>
                <span className="reset-button-text">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}