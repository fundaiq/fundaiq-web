// components/portfolio/TickerInputWithSuggestions.tsx
import { useState, useEffect, useRef } from "react";
import { SearchIcon, CheckIcon } from "lucide-react";

interface TickerData {
  name: string;
  ticker: string;
}

interface TickerInputWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function TickerInputWithSuggestions({
  value,
  onChange,
  placeholder = "e.g., TCS.NS, RELIANCE.NS",
  required = false,
  className = ""
}: TickerInputWithSuggestionsProps) {
  const [allTickers, setAllTickers] = useState<TickerData[]>([]);
  const [suggestions, setSuggestions] = useState<TickerData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load tickers from JSON file
  useEffect(() => {
    const loadTickers = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        console.log('Loading tickers from /tickers.json...');
        
        const response = await fetch('/tickers.json');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('Response text length:', text.length);
        
        const tickers: TickerData[] = JSON.parse(text);
        console.log('Loaded tickers:', tickers.length, 'items');
        console.log('First few tickers:', tickers.slice(0, 3));
        
        setAllTickers(tickers);
      } catch (error) {
        console.error('Error loading tickers:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load tickers');
        
        // Fallback to some hardcoded popular tickers
        const fallbackTickers = [
          { name: "Tata Consultancy Services", ticker: "TCS.NS" },
          { name: "Reliance Industries Ltd", ticker: "RELIANCE.NS" },
          { name: "Infosys Ltd", ticker: "INFY.NS" },
          { name: "HDFC Bank Ltd", ticker: "HDFCBANK.NS" },
          { name: "Apple Inc", ticker: "AAPL" },
          { name: "Microsoft Corp", ticker: "MSFT" },
          { name: "Alphabet Inc Class A", ticker: "GOOGL" },
          { name: "Amazon.com Inc", ticker: "AMZN" }
        ];
        console.log('Using fallback tickers:', fallbackTickers.length);
        setAllTickers(fallbackTickers);
      } finally {
        setLoading(false);
      }
    };

    loadTickers();
  }, []); // Load once on component mount

  // Filter suggestions based on input
  useEffect(() => {
    console.log('Filtering - value:', value, 'allTickers length:', allTickers.length);
    
    if (!value || value.length < 1) { // Changed from 2 to 1 for easier testing
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (allTickers.length === 0) {
      console.log('No tickers loaded yet');
      return;
    }

    const query = value.toLowerCase().trim();
    console.log('Searching for:', query);
    
    const filtered = allTickers.filter(ticker => {
      const nameMatch = ticker.name.toLowerCase().includes(query);
      const tickerMatch = ticker.ticker.toLowerCase().includes(query);
      return nameMatch || tickerMatch;
    }).slice(0, 10); // Limit to 10 suggestions

    console.log('Filtered results:', filtered.length, filtered.slice(0, 3));
    
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(-1);
  }, [value, allTickers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('Input changed to:', newValue);
    onChange(newValue);
  };

  const handleSuggestionClick = (ticker: TickerData) => {
    console.log('Selected ticker:', ticker);
    onChange(ticker.ticker);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputFocus = () => {
    console.log('Input focused, value length:', value.length, 'suggestions:', suggestions.length);
    if (value.length >= 1 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const getExchangeInfo = (ticker: string) => {
    if (ticker.endsWith('.NS')) return { exchange: 'NSE', country: '🇮🇳', color: 'bg-green-100 text-green-700' };
    if (ticker.endsWith('.BO')) return { exchange: 'BSE', country: '🇮🇳', color: 'bg-green-100 text-green-700' };
    if (ticker.endsWith('.L')) return { exchange: 'LSE', country: '🇬🇧', color: 'bg-blue-100 text-blue-700' };
    if (ticker.endsWith('.TO')) return { exchange: 'TSX', country: '🇨🇦', color: 'bg-red-100 text-red-700' };
    if (ticker.endsWith('.AX')) return { exchange: 'ASX', country: '🇦🇺', color: 'bg-yellow-100 text-yellow-700' };
    if (ticker.endsWith('.HK')) return { exchange: 'HKEX', country: '🇭🇰', color: 'bg-purple-100 text-purple-700' };
    if (ticker.endsWith('.T')) return { exchange: 'TSE', country: '🇯🇵', color: 'bg-pink-100 text-pink-700' };
    return { exchange: 'US', country: '🇺🇸', color: 'bg-indigo-100 text-indigo-700' };
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };

  console.log('Render - showSuggestions:', showSuggestions, 'suggestions length:', suggestions.length, 'loading:', loading);

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          required={required}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mt-1 p-2 bg-gray-50 rounded">
          <div>Debug: {allTickers.length} tickers loaded, {suggestions.length} suggestions, show: {showSuggestions.toString()}</div>
          <div>Value: "{value}", Length: {value.length}</div>
          <div>Loading: {loading.toString()}</div>
          {loadError && <div className="text-red-500">Error: {loadError}</div>}
          {allTickers.length > 0 && (
            <div>Sample tickers: {allTickers.slice(0, 3).map(t => t.ticker).join(', ')}</div>
          )}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto"
          style={{ zIndex: 9999 }} // Ensure it's above other elements
        >
          {suggestions.map((ticker, index) => {
            const exchangeInfo = getExchangeInfo(ticker.ticker);
            const isSelected = index === selectedIndex;
            
            return (
              <div
                key={ticker.ticker}
                className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                  isSelected ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSuggestionClick(ticker)}
                onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-sm font-bold text-indigo-600">
                        {highlightMatch(ticker.ticker, value)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${exchangeInfo.color}`}>
                        {exchangeInfo.country} {exchangeInfo.exchange}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 truncate">
                      {highlightMatch(ticker.name, value)}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckIcon className="w-4 h-4 text-indigo-600 ml-2" />
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Footer with navigation hint */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Use ↑↓ arrows to navigate, Enter to select, Esc to close
            </p>
          </div>
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-1">
        {loading ? 'Loading ticker database...' : 
         loadError ? `Error: ${loadError}` :
         value.length >= 1 && suggestions.length === 0 && !showSuggestions ? 'No matching tickers found' :
         'Start typing company name or ticker symbol for suggestions'}
      </p>
    </div>
  );
}