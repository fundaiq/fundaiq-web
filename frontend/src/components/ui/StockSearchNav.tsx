'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalStore } from '@/store/globalStore';
import { Search, TrendingUp, X, ArrowRight } from 'lucide-react';
import { useFetchTicker } from '@/components/report/hooks/useFetchTicker';
import styles from '@/styles/StockSearchNav.module.css';

interface StockSearchNavProps {
  className?: string;
}

export default function StockSearchNav({ className = "" }: StockSearchNavProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const tickerInput = useGlobalStore((s) => s.tickerInput);
  const setTickerInput = useGlobalStore((s) => s.setTickerInput);
  
  const [tickersList, setTickersList] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Use the existing hook for fetching ticker data
  const fetchTickerData = useFetchTicker(setLoading);

  // Load tickers list
  useEffect(() => {
    fetch('/tickers.json')
      .then((res) => res.json())
      .then((data) => {
        const valid = data.filter((d) => d?.name && d?.ticker);
        setTickersList(valid);
      })
      .catch((err) => console.error('Failed to load tickers:', err));
  }, []);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input changes with improved filtering
  const handleInput = (value: string) => {
    setTickerInput(value);
    setHighlightedIndex(-1);
    
    if (value.length >= 2) {
      const searchTerm = value.toLowerCase();
      const matches = tickersList.filter((entry) => {
        const name = entry?.name?.toLowerCase?.() || '';
        const ticker = entry?.ticker?.toLowerCase?.() || '';
        return name.includes(searchTerm) || ticker.includes(searchTerm);
      });
      
      // Sort by relevance: exact ticker match first, then name starts with, then contains
      const sortedMatches = matches.sort((a, b) => {
        const aTicker = (a?.ticker?.toLowerCase?.() || '');
        const bTicker = (b?.ticker?.toLowerCase?.() || '');
        const aName = (a?.name?.toLowerCase?.() || '');
        const bName = (b?.name?.toLowerCase?.() || '');
        
        // Exact ticker match gets highest priority
        if (aTicker === searchTerm) return -1;
        if (bTicker === searchTerm) return 1;
        
        // Ticker starts with search term
        if (aTicker.startsWith(searchTerm) && !bTicker.startsWith(searchTerm)) return -1;
        if (bTicker.startsWith(searchTerm) && !aTicker.startsWith(searchTerm)) return 1;
        
        // Name starts with search term
        if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
        if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
        
        // Alphabetical by ticker for equal matches
        return aTicker.localeCompare(bTicker);
      });
      
      setFiltered(sortedMatches.slice(0, 6)); // Limit results for better UX
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Enhanced keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filtered.length === 0) {
      if (e.key === 'Enter' && tickerInput.trim()) {
        handleManualSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filtered.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filtered.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          handleStockSelection(filtered[highlightedIndex]);
        } else if (filtered.length > 0) {
          handleStockSelection(filtered[0]);
        } else {
          handleManualSearch();
        }
        break;
        
      case 'Escape':
        setShowSuggestions(false);
        setIsFocused(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
        
      case 'Tab':
        if (filtered.length > 0) {
          e.preventDefault();
          handleStockSelection(filtered[0]);
        }
        break;
    }
  };

  // Handle stock selection
  const handleStockSelection = async (stock: any) => {
    if (!stock?.ticker) return;
    
    setTickerInput(stock.name || stock.ticker);
    setShowSuggestions(false);
    setIsFocused(false);
    setHighlightedIndex(-1);
    setLoading(true);
    // Navigate to report page first
    router.push('/report');
    
    // Small delay to ensure navigation, then fetch data
    setTimeout(() => {
      fetchTickerData(stock.ticker);
    }, 100);
    
  };

  // Handle manual search
  const handleManualSearch = () => {
    if (!tickerInput?.trim()) return;
    
    const input = tickerInput.toLowerCase();
    const match = tickersList.find((entry) => {
      const name = entry?.name?.toLowerCase?.() || '';
      const ticker = entry?.ticker?.toLowerCase?.() || '';
      return ticker === input || name.includes(input);
    });

    if (match) {
      handleStockSelection(match);
    } else {
      // For educational purposes, show message about stock not found
      console.log('Stock information not available for educational analysis');
    }
  };

  // Clear search
  const clearSearch = () => {
    setTickerInput('');
    setShowSuggestions(false);
    setIsFocused(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };
  // Add this right before the return statement in your component

  return (
    <div className={`${styles.searchContainer} ${className}`} ref={searchRef}>
      {/* Search Input Container */}
      <div className="relative">
        <div className="relative flex items-center">
          {/* Search Icon - Inside input */}
          <div className="absolute left-3 z-10 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          
          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={tickerInput || ''}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              if (filtered.length > 0) setShowSuggestions(true);
            }}
            placeholder="Search stocks for analysis..."
            className="w-full pl-10 pr-10 py-3 text-base 
                     bg-gray-50 dark:bg-gray-800 
                     border border-gray-200 dark:border-gray-600 
                     rounded-lg
                     text-gray-900 dark:text-gray-100
                     placeholder:text-gray-500 dark:placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                     focus:border-transparent
                     transition-all duration-200
                     hover:border-gray-300 dark:hover:border-gray-500"
            style={{ minWidth: '320px' }}
          />
          
          {/* Clear Button - Inside input */}
          {loading ? (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20"> 
              Loading...
            </div>
          ) : tickerInput ? (
            <button
              onClick={clearSearch}
              className="absolute right-3 z-10 p-0.5 
                      text-gray-400 hover:text-gray-600 
                      dark:text-gray-500 dark:hover:text-gray-300
                      transition-colors duration-200"
              type="button"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        
      </div>

      {/* Search Suggestions Dropdown - PROPER CSS MODULE STYLING */}
      {showSuggestions && filtered.length > 0 && (
        <div className={styles.suggestionsDropdown}>
          <div className="py-2">
            {filtered.map((stock, index) => (
              <button
                key={`${stock.ticker}-${index}`}
                onClick={() => handleStockSelection(stock)}
                className={`${styles.suggestionItem} ${
                  index === highlightedIndex ? styles.highlighted : ''
                }`}
              >
                <div className={styles.suggestionIcon}>
                  <TrendingUp />
                </div>
                
                <div className={styles.suggestionContent}>
                  <div className={styles.suggestionTicker}>
                    {stock.ticker}
                  </div>
                  <div className={styles.suggestionName}>
                    {stock.name}
                  </div>
                </div>
                
                <ArrowRight className={styles.suggestionArrow} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {showSuggestions && filtered.length === 0 && tickerInput && tickerInput.length >= 2 && (
        <div className={styles.noResultsContainer}>
          <div className={styles.noResultsIcon}>
            <Search />
          </div>
          <p className={styles.noResultsText}>
            No stocks found for "<strong>{tickerInput}</strong>"
          </p>
        </div>
      )}
    </div>
  );
}