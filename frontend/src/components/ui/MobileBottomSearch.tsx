'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGlobalStore } from '@/store/globalStore';
import { Search, TrendingUp, X, ArrowRight } from 'lucide-react';
import { useFetchTicker } from '@/components/report/hooks/useFetchTicker';
import styles from '@/styles/MobileBottomSearch.module.css';

export default function MobileBottomSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const tickerInput = useGlobalStore((s) => s.tickerInput);
  const setTickerInput = useGlobalStore((s) => s.setTickerInput);
  
  const [tickersList, setTickersList] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
      
      setFiltered(sortedMatches.slice(0, 8)); // Limit results for mobile UX
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
        setIsExpanded(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle stock selection
  const handleStockSelection = async (stock: any) => {
    if (!stock?.ticker) return;
    
    setTickerInput(stock.name || stock.ticker);
    setShowSuggestions(false);
    setIsExpanded(false);
    setHighlightedIndex(-1);
    
    // Navigate to report page first if not already there
    if (pathname !== '/report') {
      router.push('/report');
    }
    
    // Small delay to ensure navigation, then fetch data
    setTimeout(() => {
      fetchTickerData(stock.ticker);
    }, pathname !== '/report' ? 100 : 0);
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
    
    const finalTicker = match?.ticker || tickerInput;
    
    // Navigate to report page first if not already there
    if (pathname !== '/report') {
      router.push('/report');
    }
    
    // Small delay to ensure navigation, then fetch data
    setTimeout(() => {
      fetchTickerData(finalTicker);
      setIsExpanded(false);
    }, pathname !== '/report' ? 100 : 0);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        if (!tickerInput?.trim()) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tickerInput]);

  return (
    <div className={styles.mobileSearchContainer} ref={searchRef}>
      {/* Backdrop for expanded state */}
      {isExpanded && (
        <div 
          className={styles.backdrop}
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Suggestions Dropdown - Above the search bar */}
      {showSuggestions && filtered.length > 0 && isExpanded && (
        <div className={styles.suggestionsContainer}>
          <div className={styles.suggestionsDropdown}>
            {filtered.map((item, index) => (
              <button
                key={`${item.ticker}-${index}`}
                className={`${styles.suggestionItem} ${
                  index === highlightedIndex ? styles.highlighted : ''
                }`}
                onClick={() => handleStockSelection(item)}
              >
                <div className={styles.suggestionIcon}>
                  <TrendingUp />
                </div>
                
                <div className={styles.suggestionContent}>
                  <div className={styles.suggestionTicker}>
                    {item.ticker}
                  </div>
                  <div className={styles.suggestionName}>
                    {item.name}
                  </div>
                </div>
                
                <ArrowRight className={styles.suggestionArrow} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Search Bar */}
      <div className={styles.searchBar}>
        <div className={styles.searchContent}>
          {/* Collapsed State - Beautiful Trigger */}
          {!isExpanded ? (
            <button
              onClick={() => {
                setIsExpanded(true);
                // Focus input after animation
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className={styles.collapsedButton}
            >
              <div className={styles.collapsedIcon}>
                <Search />
              </div>
              
              <div className={styles.collapsedContent}>
                <div className={styles.collapsedText}>
                  {tickerInput || 'Search stocks...'}
                </div>
                <div className={styles.collapsedSubtext}>
                  Tap to find companies
                </div>
              </div>
              
              {tickerInput && (
                <div className={styles.collapsedIndicator}>
                  <TrendingUp />
                </div>
              )}
            </button>
          ) : (
            <>
              {/* Expanded Search Input */}
              <div className={styles.expandedInput}>
                                  <input
                  ref={inputRef}
                  type="text"
                  placeholder="Find a stock..."
                  value={tickerInput || ''}
                  onChange={(e) => handleInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  className={styles.searchInput}
                  autoFocus
                />
                
                {/* Search Icon */}
                <div className={styles.inputIcon}>
                  <Search />
                </div>
                
                {/* Loading or Clear Button */}
                {loading ? (
                  <div className={styles.inputAction}>
                    <div className={styles.loadingSpinner} />
                  </div>
                ) : tickerInput ? (
                  <button
                    onClick={() => {
                      setTickerInput('');
                      setShowSuggestions(false);
                      inputRef.current?.focus();
                    }}
                    className={styles.inputAction}
                  >
                    <X />
                  </button>
                ) : null}
              </div>

              {/* Search Button */}
              <button
                onClick={handleManualSearch}
                disabled={loading || !tickerInput?.trim()}
                className={styles.searchButton}
              >
                {loading ? (
                  <div className={styles.loadingSpinner} />
                ) : (
                  <TrendingUp />
                )}
                <span className={styles.searchButtonText}>Search</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsExpanded(false)}
                className={styles.closeButton}
              >
                <X />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}