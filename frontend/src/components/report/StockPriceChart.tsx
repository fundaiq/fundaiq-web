// src/components/StockPriceChart.tsx
"use client";

import React from "react";
import TradingViewChart from "./TradingViewChart";

export default function StockPriceChart({ ticker }: { ticker?: string }) {
  return (
    <div style={{ 
      width: "100%", 
      display: "flex", 
      justifyContent: "center", 
      padding: "20px"
    }}>
      <TradingViewChart symbol={ticker} />
    </div>
  );
}