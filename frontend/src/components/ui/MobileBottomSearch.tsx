'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGlobalStore } from '@/store/globalStore';
import { Search, TrendingUp, X, ArrowRight, HelpCircle } from 'lucide-react';
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

  // Enhanced keyboard navigation - NO AUTO-SELECTION
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
        setIsExpanded(false); // Mobile-specific
        setHighlightedIndex(-1);
        setShowTooltip(false); // Mobile-specific
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
    setIsExpanded(false);
    setHighlightedIndex(-1);
    setShowTooltip(false);
    
    // Navigate to report page first if not already there
    if (pathname !== '/report') {
      router.push('/report');
    }
    
    // Small delay to ensure navigation, then fetch data
    setTimeout(() => {
      fetchTickerData(stock.ticker);
    }, pathname !== '/report' ? 100 : 0);
  };

  // Handle manual search - UPDATED to allow any input
  const handleManualSearch = () => {
    if (!tickerInput?.trim()) return;
    
    // Search exactly what user typed
    const userInput = tickerInput.trim().toUpperCase();
    
    setShowSuggestions(false);
    setIsExpanded(false); // Mobile-specific
    setHighlightedIndex(-1);
    setShowTooltip(false); // Mobile-specific
    setLoading(true);
    
    // Navigate to report page first if not already there
    if (pathname !== '/report') {
      router.push('/report');
    }
    
    // Small delay to ensure navigation, then fetch data
    setTimeout(() => {
      fetchTickerData(userInput); // Search exactly what user typed
    }, pathname !== '/report' ? 100 : 0);
  };

  // Don't show on desktop
  if (typeof window !== 'undefined' && window.innerWidth > 768) {
    return null;
  }

  return (
    <div className={styles.mobileSearchContainer} ref={searchRef}>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className={styles.backdrop}
          onClick={() => {
            setIsExpanded(false);
            setShowTooltip(false);
          }}
        />
      )}

      {/* Suggestions */}
      {isExpanded && showSuggestions && filtered.length > 0 && (
        <div className={styles.suggestionsContainer}>
          <div className={styles.suggestionsDropdown}>
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

      {/* Main Search Bar */}
      <div className={styles.searchBar}>
        <div className={styles.searchBarInner}>
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
                  Add .NS (NSE) or .BO (BSE) for Indian stocks
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
                  placeholder="e.g., RELIANCE.NS, TCS.BO"
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
                
                {/* Right Controls */}
                <div className={styles.rightControls}>
                  {/* Loading or Clear Button */}
                  {loading ? (
                    <div className={styles.loadingSpinner} />
                  ) : tickerInput ? (
                    <button
                      onClick={() => {
                        setTickerInput('');
                        setShowSuggestions(false);
                        inputRef.current?.focus();
                      }}
                      className={styles.clearButton}
                    >
                      <X />
                    </button>
                  ) : null}

                  {/* Tooltip Icon */}
                  <div 
                    className={styles.tooltipContainer}
                    onClick={() => setShowTooltip(!showTooltip)}
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
                  <Search />
                )}
                <span className={styles.searchButtonText}>Search</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsExpanded(false);
                  setShowTooltip(false);
                }}
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