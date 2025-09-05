import { useState } from 'react';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  PlusCircle,
  Edit,
  Trash2,
  DollarSign,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';

interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  portfolio: string;
}

export default function PortfolioDashboard() {
  const [selectedPortfolio, setSelectedPortfolio] = useState('All Portfolios');

  // Mock data - replace with actual data from your store/API
  const portfolios = ['All Portfolios', 'Growth Portfolio', 'Value Portfolio', 'Dividend Portfolio'];
  const mockHoldings: Holding[] = [
    {
      id: '1',
      symbol: 'RELIANCE.NS',
      name: 'Reliance Industries',
      quantity: 100,
      avgPrice: 2450,
      currentPrice: 2680,
      value: 268000,
      pnl: 23000,
      pnlPercent: 9.39,
      portfolio: 'Growth Portfolio'
    },
    {
      id: '2',
      symbol: 'TCS.NS',
      name: 'Tata Consultancy Services',
      quantity: 50,
      avgPrice: 3200,
      currentPrice: 3850,
      value: 192500,
      pnl: 32500,
      pnlPercent: 20.31,
      portfolio: 'Growth Portfolio'
    },
    {
      id: '3',
      symbol: 'HDFCBANK.NS',
      name: 'HDFC Bank',
      quantity: 75,
      avgPrice: 1580,
      currentPrice: 1520,
      value: 114000,
      pnl: -4500,
      pnlPercent: -3.80,
      portfolio: 'Value Portfolio'
    },
    {
      id: '4',
      symbol: 'ITC.NS',
      name: 'ITC Limited',
      quantity: 200,
      avgPrice: 420,
      currentPrice: 445,
      value: 89000,
      pnl: 5000,
      pnlPercent: 5.95,
      portfolio: 'Dividend Portfolio'
    }
  ];

  const totalValue = mockHoldings.reduce((sum, holding) => sum + holding.value, 0);
  const totalPnL = mockHoldings.reduce((sum, holding) => sum + holding.pnl, 0);
  const totalPnLPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const filteredHoldings = selectedPortfolio === 'All Portfolios' 
    ? mockHoldings 
    : mockHoldings.filter(holding => holding.portfolio === selectedPortfolio);

  return (
    <div className="min-h-screen bg-surface-secondary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Portfolio Dashboard</h1>
            <p className="mt-2 text-secondary">Track and analyze your investment portfolio</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Holding
            </button>
          </div>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface rounded-xl shadow-theme p-6 border-default border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl shadow-theme p-6 border-default border">
            <div className="flex items-center">
              <div className={`p-3 rounded-xl ${totalPnL >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                {totalPnL >= 0 ? (
                  <TrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDownIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
                </p>
                <p className={`text-sm ${totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ({totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl shadow-theme p-6 border-default border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Total Holdings</p>
                <p className="text-2xl font-bold text-primary">{mockHoldings.length}</p>
                <p className="text-sm text-secondary">Across {portfolios.length - 1} portfolios</p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Filter */}
        <div className="mb-6">
          <select
            value={selectedPortfolio}
            onChange={(e) => setSelectedPortfolio(e.target.value)}
            className="bg-surface border-default border rounded-lg px-4 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {portfolios.map((portfolio) => (
              <option key={portfolio} value={portfolio}>
                {portfolio}
              </option>
            ))}
          </select>
        </div>

        {/* Holdings Table */}
        <div className="bg-surface rounded-xl shadow-theme border-default border overflow-hidden">
          <div className="px-6 py-4 border-b border-default">
            <h2 className="text-lg font-semibold text-primary">Holdings</h2>
            <p className="text-sm text-secondary">Your current investment positions</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Avg Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">P&L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Portfolio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default">
                {filteredHoldings.map((holding) => (
                  <tr key={holding.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-primary">{holding.symbol}</div>
                        <div className="text-sm text-secondary">{holding.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      {holding.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      ₹{holding.avgPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      ₹{holding.currentPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium">
                      {formatCurrency(holding.value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {holding.pnl >= 0 ? (
                        <div className="flex items-center justify-end">
                          <TrendingUpIcon className="w-4 h-4 mr-1" />
                          <div className="text-sm">
                            <div className="text-green-600 font-medium">+{formatCurrency(holding.pnl)}</div>
                            <div className="text-green-600 text-xs">(+{holding.pnlPercent.toFixed(2)}%)</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end">
                          <TrendingDownIcon className="w-4 h-4 mr-1" />
                          <div className="text-sm">
                            <div className="text-red-600 font-medium">{formatCurrency(Math.abs(holding.pnl))}</div>
                            <div className="text-red-600 text-xs">({holding.pnlPercent.toFixed(2)}%)</div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      {holding.portfolio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="text-accent hover:text-accent/80">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1">Diversification Score</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">8.5/10</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Well diversified across sectors</div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="text-green-600 dark:text-green-400 text-sm font-medium mb-1">Risk Assessment</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">Moderate</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">Balanced risk profile</div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-1">Performance Rating</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">B+</div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Above market average</div>
          </div>
        </div>

        {/* Analysis Insights - SEBI COMPLIANT VERSION */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800 mt-8">
          <h5 className="text-amber-800 dark:text-amber-200 font-semibold mb-2">Portfolio Analysis Insights</h5>
          <div className="text-xs text-amber-700 dark:text-amber-300 mb-2">
            <strong>Educational Analysis Only:</strong> These insights are mathematical observations for informational purposes and do not constitute investment advice.
          </div>
          <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
            <li>• Technology sector represents 35% of portfolio (mathematical observation)</li>
            <li>• Small cap allocation currently at 15% (portfolio composition analysis)</li>
            <li>• Banking sector showing mixed performance patterns (historical data observation)</li>
            <li>• Portfolio correlation with market indices: 0.73 (statistical measurement)</li>
          </ul>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-3 font-medium">
            Note: All observations are for educational purposes. Consult qualified financial advisors for investment decisions.
          </div>
        </div>
      </div>
    </div>
  );
}