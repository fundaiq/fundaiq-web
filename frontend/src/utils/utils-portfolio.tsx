// Fixed utils/portfolio.ts with proper null/undefined handling
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

export const formatCurrency = (value: string | number | null | undefined) => {
  if (!value || value === "0" || value === 0) return "₹0";
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "₹0";
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

export const formatNumber = (value: string | number | null | undefined) => {
  // ✅ Fixed: Handle null/undefined/empty values
  if (value === null || value === undefined || value === "") return "0";
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  // ✅ Fixed: Handle NaN values
  if (isNaN(num)) return "0";
  
  return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

export const formatPercent = (value: string | number | null | undefined) => {
  if (!value && value !== 0) return "--";
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "--";
  
  const isPositive = num >= 0;
  return (
    <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      {isPositive ? <TrendingUpIcon className="w-4 h-4 mr-1" /> : <TrendingDownIcon className="w-4 h-4 mr-1" />}
      {num.toFixed(2)}%
    </span>
  );
};

export const getPnLColor = (value: string | number | null | undefined) => {
  if (!value && value !== 0) return "text-gray-500";
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "text-gray-500";
  
  return num >= 0 ? "text-green-600" : "text-red-600";
};

// ✅ Added: Safe number parsing utility
export const safeParseFloat = (value: string | number | null | undefined, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === "") return defaultValue;
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? defaultValue : num;
};

// ✅ Added: Safe formatting for large numbers
export const formatLargeNumber = (value: string | number | null | undefined) => {
  const num = safeParseFloat(value);
  
  if (num === 0) return "0";
  
  if (Math.abs(num) >= 10000000) {
    return `${(num / 10000000).toFixed(2)}Cr`;
  } else if (Math.abs(num) >= 100000) {
    return `${(num / 100000).toFixed(2)}L`;
  } else if (Math.abs(num) >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  
  return formatNumber(num);
};