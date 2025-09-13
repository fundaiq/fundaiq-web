// TradingViewChart.tsx - With symbol fallback and better config
"use client";

import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    TradingView?: any;
  }
}

export interface TradingViewChartProps {
  symbol?: string;
}

let widgetCounter = 0;

export default function TradingViewChart({ symbol }: TradingViewChartProps) {
  const [containerId] = useState(() => `tv-chart-${++widgetCounter}`);
  const [status, setStatus] = useState<"loading" | "loaded" | "error" | "empty">("empty");
  const [error, setError] = useState<string>("");
  const [currentSymbol, setCurrentSymbol] = useState<string>("");

  useEffect(() => {
    if (!symbol) {
      setStatus("empty");
      return;
    }

    // Try different symbol formats as fallbacks
    const symbolVariants = [
      `NSE:${symbol.toUpperCase()}`,
      `${symbol.toUpperCase()}.NS`,
      symbol.toUpperCase(),
      'NSE:RELIANCE', // Known working symbol as fallback
      'NASDAQ:AAPL'   // International fallback
    ];

    let variantIndex = 0;
    
    setStatus("loading");
    setError("");

    const trySymbol = (symbolToTry: string) => {
      setCurrentSymbol(symbolToTry);
      console.log(`Trying symbol: ${symbolToTry}`);

      const initChart = () => {
        setTimeout(() => {
          const container = document.getElementById(containerId);
          
          if (!container) {
            setError(`Container ${containerId} not found`);
            setStatus("error");
            return;
          }

          const loadScript = () => {
            if (window.TradingView) {
              createWidget(symbolToTry);
              return;
            }

            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.onload = () => createWidget(symbolToTry);
            script.onerror = () => {
              setError("Failed to load TradingView script");
              setStatus("error");
            };
            document.head.appendChild(script);
          };

          const createWidget = (sym: string) => {
            if (!window.TradingView) {
              setError("TradingView not available");
              setStatus("error");
              return;
            }

            try {
              container.innerHTML = '';
              
              const widget = new window.TradingView.widget({
                symbol: sym,
                interval: 'D',
                container_id: containerId,
                autosize: false,
                width: 800,
                height: 500,
                theme: 'light',
                locale: 'en',
                hide_top_toolbar: false,
                hide_side_toolbar: false,
                allow_symbol_change: true,
                // Additional settings to help with loading
                save_image: false,
                studies: [],
                show_popup_button: true,
                popup_width: "1000",
                popup_height: "650",
                // Error handling
                onChartReady: () => {
                  console.log(`Chart ready for symbol: ${sym}`);
                  setStatus("loaded");
                },
                loading_screen: { backgroundColor: "#ffffff", foregroundColor: "#333333" }
              });

              // Set a timeout to check if widget loaded properly
              setTimeout(() => {
                if (status === "loading") {
                  console.log(`Symbol ${sym} failed to load, trying next variant...`);
                  variantIndex++;
                  if (variantIndex < symbolVariants.length) {
                    trySymbol(symbolVariants[variantIndex]);
                  } else {
                    setError(`All symbol variants failed. Last tried: ${sym}`);
                    setStatus("error");
                  }
                }
              }, 5000); // 5 second timeout

              console.log(`Widget created for symbol: ${sym}`);
              
            } catch (err) {
              console.log(`Error with symbol ${sym}:`, err);
              variantIndex++;
              if (variantIndex < symbolVariants.length) {
                trySymbol(symbolVariants[variantIndex]);
              } else {
                setError(`Widget creation failed for all variants: ${err}`);
                setStatus("error");
              }
            }
          };

          loadScript();
        }, 500);
      };

      initChart();
    };

    // Start with the first symbol variant
    trySymbol(symbolVariants[0]);

    return () => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [symbol, containerId]);

  if (!symbol) {
    return (
      <div style={{ 
        width: "800px", 
        height: "500px", 
        border: "1px solid #ccc", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        backgroundColor: "#f5f5f5"
      }}>
        <p>No symbol provided</p>
      </div>
    );
  }

  const containerStyle = {
    width: "800px",
    height: "500px", 
    border: "2px solid #007bff",
    position: "relative" as const,
    backgroundColor: "#fff"
  };

  if (status === "loading") {
    return (
      <div style={containerStyle}>
        <div style={{ 
          position: "absolute" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center" as const
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            animation: "spin 2s linear infinite",
            margin: "0 auto 10px"
          }}></div>
          <p>Loading chart...</p>
          <p style={{ fontSize: "12px", color: "#666" }}>
            Trying: {currentSymbol || symbol}
          </p>
          <p style={{ fontSize: "10px", color: "#999" }}>
            Container: {containerId}
          </p>
        </div>
        <div id={containerId} style={{ width: "100%", height: "100%" }}></div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{...containerStyle, borderColor: "#dc3545", backgroundColor: "#f8d7da"}}>
        <div style={{ 
          position: "absolute" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center" as const,
          padding: "20px"
        }}>
          <p style={{ color: "#721c24", fontWeight: "bold", marginBottom: "10px" }}>Error Loading Chart</p>
          <p style={{ color: "#721c24", fontSize: "14px", marginBottom: "10px" }}>{error}</p>
          <p style={{ fontSize: "12px", color: "#666", marginBottom: "15px" }}>
            Requested: {symbol} | Last tried: {currentSymbol}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Reload Page
          </button>
        </div>
        <div id={containerId} style={{ width: "100%", height: "100%" }}></div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div id={containerId} style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
}