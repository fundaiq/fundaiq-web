// components/PortfolioSummary.tsx
import { DollarSignIcon, BarChart3Icon, TrendingUpIcon } from "lucide-react";
import { Summary } from "../../types/portfolio";
import { formatCurrency, getPnLColor } from "../../utils/portfolio";

interface PortfolioSummaryProps {
  data: Summary;
}

export default function PortfolioSummary({ data }: PortfolioSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">Total Value</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(data.totals.total_value_in_inr)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
            <DollarSignIcon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">Total Cost</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(data.totals.total_cost_in_inr)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl shadow-lg">
            <BarChart3Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">Unrealized P&L</p>
            <p className={`text-3xl font-bold ${getPnLColor(data.totals.unrealized_pnl_in_inr)}`}>
              {formatCurrency(data.totals.unrealized_pnl_in_inr)}
            </p>
          </div>
          <div className={`p-4 rounded-2xl shadow-lg ${
            data.totals.unrealized_pnl_in_inr && parseFloat(data.totals.unrealized_pnl_in_inr) >= 0 
              ? 'bg-gradient-to-br from-green-500 to-green-600' 
              : 'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
            <TrendingUpIcon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}