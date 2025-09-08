'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalStore } from '@/store/globalStore';
import { Search, TrendingUp, X, ArrowRight, HelpCircle } from 'lucide-react';
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
  const [showTooltip, setShowTooltip] = useState(false);

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

  // Handle clicks outside to close suggestions and tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
        setHighlightedIndex(-1);
        setShowTooltip(false);
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
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (showSuggestions && filtered.length > 0) {
          setHighlightedIndex(prev => 
            prev < filtered.length - 1 ? prev + 1 : 0
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (showSuggestions && filtered.length > 0) {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filtered.length - 1
          );
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        // ONLY do manual search - never auto-select suggestions
        if (tickerInput.trim()) {
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
        // Let browser handle normal Tab behavior
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

  // Handle manual search - UPDATED to allow any input
  const handleManualSearch = () => {
    if (!tickerInput?.trim()) return;
    
    // Search exactly what user typed
    const userInput = tickerInput.trim().toUpperCase();
    
    setShowSuggestions(false);
    setIsFocused(false);
    setHighlightedIndex(-1);
    setLoading(true);
    
    // Navigate to report page first
    router.push('/report');
    
    // Small delay to ensure navigation, then fetch data
    setTimeout(() => {
      fetchTickerData(userInput); // Search exactly what user typed
    }, 100);
  };

  // Clear search input
  const clearSearch = () => {
    setTickerInput('');
    setShowSuggestions(false);
    setFiltered([]);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={`${styles.searchContainer} ${className}`} ref={searchRef}>
      <div className={styles.searchInputWrapper}>
        <div className={styles.searchInputContainer}>
          <Search className={styles.searchIcon} />
          
          <input
            ref={inputRef}
            type="text"
            value={tickerInput}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              if (tickerInput.length >= 2) setShowSuggestions(true);
            }}
            placeholder="Search stocks (e.g., RELIANCE.NS, TCS.BO)"
            className={styles.searchInput}
            autoComplete="off"
            spellCheck="false"
          />

          {/* Search Button and Tooltip */}
          <div className={styles.rightControls}>
            {/* Search Button */}
            <button
              onClick={handleManualSearch}
              disabled={!tickerInput?.trim() || loading}
              className={styles.searchButton}
              type="button"
              aria-label="Search stock"
              title="Search for this stock"
            >
              <Search className={styles.searchButtonIcon} />
            </button>

            {/* Tooltip Icon */}
            <div 
              className={styles.tooltipContainer}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)} // For mobile touch
            >
              <HelpCircle className={styles.helpIcon} />
              
              {/* Tooltip Content */}
              {showTooltip && (
                <div className={styles.tooltip}>
                  <div className={styles.tooltipContent}>
                    <p className={styles.tooltipTitle}>Stock Exchange Guide:</p>
                    <div className={styles.tooltipList}>
                      <div className={styles.tooltipItem}>
                        <span className={styles.tooltipLabel}>.NS</span>
                        <span className={styles.tooltipText}>NSE (National Stock Exchange)</span>
                      </div>
                      <div className={styles.tooltipItem}>
                        <span className={styles.tooltipLabel}>.BO</span>
                        <span className={styles.tooltipText}>BSE (Bombay Stock Exchange)</span>
                      </div>
                    </div>
                    <p className={styles.tooltipExample}>
                      Example: RELIANCE.NS, TCS.BO
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clear button (when no search button is needed) */}
          {!tickerInput && !loading && (
            <div className={styles.placeholderSpace}></div>
          )}
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
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
          <p className={styles.noResultsHint}>
            Try clicking the search button to search anyway
          </p>
        </div>
      )}
    </div>
  );
}