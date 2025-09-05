'use client';

import { useEffect } from 'react';

export function SEBIComplianceNotice() {
  return (
    <div
      id="sebi-compliance-notice"
      className="fixed bottom-4 right-4 z-30 max-w-xs bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600 rounded-lg p-3 shadow-lg hidden md:block"
      role="banner"
      aria-label="Educational disclaimer"
    >
      <div className="flex items-start gap-2">
        <span className="text-yellow-600 dark:text-yellow-400 text-sm">📚</span>
        <div>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
            Educational Analysis Only
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Not investment advice. For learning purposes.
          </p>
        </div>
        <button
          onClick={() => {
            const element = document.getElementById('sebi-compliance-notice');
            if (element) element.style.display = 'none';
          }}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-auto"
          aria-label="Close disclaimer"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ScrollToTopButton() {
  useEffect(() => {
    const handleScroll = () => {
      const button = document.getElementById('scroll-to-top');
      if (!button) return;
      
      if (window.scrollY > 300) {
        button.classList.remove('translate-y-16', 'opacity-0');
        button.classList.add('translate-y-0', 'opacity-100');
      } else {
        button.classList.add('translate-y-16', 'opacity-0');
        button.classList.remove('translate-y-0', 'opacity-100');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      id="scroll-to-top"
      className="fixed bottom-20 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 transform translate-y-16 opacity-0 z-40 flex items-center justify-center"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}

export function GlobalLoadingIndicator() {
  useEffect(() => {
    const showLoading = () => {
      const element = document.getElementById('global-loading');
      if (element) element.classList.remove('hidden');
    };

    const hideLoading = () => {
      const element = document.getElementById('global-loading');
      if (element) element.classList.add('hidden');
    };

    window.addEventListener('beforeunload', showLoading);
    window.addEventListener('load', hideLoading);

    return () => {
      window.removeEventListener('beforeunload', showLoading);
      window.removeEventListener('load', hideLoading);
    };
  }, []);

  return (
    <div
      id="global-loading"
      className="fixed top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800 z-50 hidden"
    >
      <div className="h-full bg-blue-600 animate-pulse"></div>
    </div>
  );
}

export function GlobalScripts() {
  useEffect(() => {
    // Keyboard navigation support
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key closes modals and dropdowns
      if (e.key === 'Escape') {
        document.querySelectorAll('[data-modal], [data-dropdown]').forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });
      }
      
      // Ctrl/Cmd + K opens search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Performance monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          console.log('Page Load Performance:', {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            totalTime: perfData.loadEventEnd - perfData.fetchStart
          });
        }
      }, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}