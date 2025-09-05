import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!showScrollTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 p-4 bg-accent hover:bg-blue-700 dark:hover:bg-blue-500 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl z-40 group"
    >
      <ArrowUp className="w-5 h-5 group-hover:animate-bounce" />
    </button>
  );
}