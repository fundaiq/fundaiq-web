// Enhanced portfolios page with dashboard features
"use client";

import { useEffect, useState } from "react";
import apiFetch, { getMe } from "@/app/lib/api";
import PortfolioDashboard from "@/components/portfolio/PortfolioDashboard";

import { 
  PlusIcon, 
  TrendingUpIcon, 
  BarChart3Icon, 
  ArrowRightIcon, 
  LogOutIcon, 
  PieChartIcon,
  DollarSignIcon,
  Target,
  Activity,
  Eye,
  ChartPieIcon
} from "lucide-react";

type Portfolio = { 
  id: string; 
  name: string; 
  base_currency: string;
  // Extended portfolio data from backend
  total_value?: string;
  total_cost?: string;
  unrealized_pnl?: string;
  holdings_count?: number;
};

type ConsolidatedData = {
  total_portfolios: number;
  total_invested: string;
  total_current_value: string;
  total_unrealized_pnl: string;
  total_holdings: number;
  best_performer?: { name: string; return_pct: string };
  worst_performer?: { name: string; return_pct: string };
};

export default function PortfoliosPage() {
  const [rows, setRows] = useState<Portfolio[]>([]);
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedData | null>(null);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  async function checkAuth() {
    try {
      const user = await getMe();
      if (user) {
        setUserInfo(user);
        setIsAuthenticated(true);
        return true;
      } else {
        setIsAuthenticated(false);
        const currentPath = window.location.pathname + window.location.search;
        const redirectUrl = `/auth?next=${encodeURIComponent(currentPath)}`;
        window.location.href = redirectUrl;
        return false;
      }
    } catch (e: any) {
      setIsAuthenticated(false);
      const currentPath = window.location.pathname + window.location.search;
      const redirectUrl = `/auth?next=${encodeURIComponent(currentPath)}`;
      window.location.href = redirectUrl;
      return false;
    }
  }

  async function load() {
    try {
      // Load portfolios
      const portfoliosData = await apiFetch("/portfolios");
      
      // For each portfolio, get summary data
      const portfoliosWithData = await Promise.all(
        portfoliosData.map(async (portfolio: Portfolio) => {
          try {
            const summary = await apiFetch(`/portfolios/${portfolio.id}`);
            return {
              ...portfolio,
              total_value: summary.totals.total_value_in_inr,
              total_cost: summary.totals.total_cost_in_inr,
              unrealized_pnl: summary.totals.unrealized_pnl_in_inr,
              holdings_count: summary.holdings.length
            };
          } catch (e) {
            // If individual portfolio fails, return basic data
            return {
              ...portfolio,
              total_value: "0",
              total_cost: "0", 
              unrealized_pnl: "0",
              holdings_count: 0
            };
          }
        })
      );

      setRows(portfoliosWithData);

      // Calculate consolidated data
      if (portfoliosWithData.length > 0) {
        const consolidated = calculateConsolidatedData(portfoliosWithData);
        setConsolidatedData(consolidated);
      }

      setMsg("");
    } catch (e: any) {
      setMsg("Load failed: " + e.message);
      if (e.message.includes('401') || e.message.includes('Unauthorized')) {
        const currentPath = window.location.pathname + window.location.search;
        const redirectUrl = `/auth?next=${encodeURIComponent(currentPath)}`;
        window.location.href = redirectUrl;
      }
    }
  }

  const calculateConsolidatedData = (portfolios: Portfolio[]): ConsolidatedData => {
    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalUnrealizedPnl = 0;
    let totalHoldings = 0;

    portfolios.forEach(portfolio => {
      totalInvested += parseFloat(portfolio.total_cost || "0");
      totalCurrentValue += parseFloat(portfolio.total_value || "0");
      totalUnrealizedPnl += parseFloat(portfolio.unrealized_pnl || "0");
      totalHoldings += portfolio.holdings_count || 0;
    });

    return {
      total_portfolios: portfolios.length,
      total_invested: totalInvested.toFixed(2),
      total_current_value: totalCurrentValue.toFixed(2),
      total_unrealized_pnl: totalUnrealizedPnl.toFixed(2),
      total_holdings: totalHoldings
    };
  };

  useEffect(() => {
    async function init() {
      const authenticated = await checkAuth();
      if (authenticated) {
        await load();
      }
    }
    init();
  }, []);

  const handleCreatePortfolio = async () => {
    if (!name.trim()) {
      setMsg("Please enter a portfolio name");
      return;
    }
    
    setIsCreating(true);
    try {
      await apiFetch("/portfolios", { 
        method: "POST", 
        body: JSON.stringify({ name: name.trim(), base_currency: "INR" }) 
      });
      setMsg("Portfolio created successfully!");
      setName(""); 
      await load();
    } catch (e: any) { 
      setMsg("Create failed: " + e.message);
      if (e.message.includes('401') || e.message.includes('Unauthorized')) {
        const currentPath = window.location.pathname + window.location.search;
        const redirectUrl = `/auth?next=${encodeURIComponent(currentPath)}`;
        window.location.href = redirectUrl;
      }
    } finally {
      setIsCreating(false);
    }
  };

  const formatCurrency = (value: string | null | undefined) => {
    if (!value || value === "0" || value === "0.00") return "₹0";
    const num = parseFloat(value);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(2)}K`;
    return `₹${num.toFixed(2)}`;
  };

  const getPnLColor = (value: string | null | undefined) => {
    if (!value) return "text-gray-500";
    const num = parseFloat(value);
    return num >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary text-lg">Loading your portfolios...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="bg-surface shadow-theme border-b border-default sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-accent">
                Portfolio Dashboard
              </h1>
              <p className="text-secondary mt-1">Welcome back, {userInfo?.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              {rows.length > 1 && (
                <button 
                  onClick={() => setShowDashboard(!showDashboard)}
                  className="flex items-center px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-all duration-200"
                >
                  <ChartPieIcon className="w-4 h-4 mr-2" />
                  {showDashboard ? 'Hide Dashboard' : 'Show Dashboard'}
                </button>
              )}
              <button 
                onClick={async () => {
                  try {
                    await apiFetch("/auth/logout", { method: "POST" });
                    window.location.href = "/auth";
                  } catch (e) {
                    console.error("Logout failed:", e);
                  }
                }}
                className="flex items-center px-4 py-2 text-secondary hover:text-primary hover:bg-surface-secondary rounded-xl transition-all duration-200"
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Consolidated Dashboard (only show if multiple portfolios) */}
        {rows.length > 1 && showDashboard && consolidatedData && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6">Consolidated Overview</h2>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card p-6 shadow-theme">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary mb-2">Total Invested</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(consolidatedData.total_invested)}
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                    <DollarSignIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="card p-6 shadow-theme">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary mb-2">Current Value</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(consolidatedData.total_current_value)}
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                    <TrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="card p-6 shadow-theme">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary mb-2">Total P&L</p>
                    <p className={`text-2xl font-bold ${getPnLColor(consolidatedData.total_unrealized_pnl)}`}>
                      {formatCurrency(consolidatedData.total_unrealized_pnl)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${
                    parseFloat(consolidatedData.total_unrealized_pnl) >= 0 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    <Target className="w-6 h-6 text-current" />
                  </div>
                </div>
              </div>

              <div className="card p-6 shadow-theme">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary mb-2">Total Holdings</p>
                    <p className="text-2xl font-bold text-primary">
                      {consolidatedData.total_holdings}
                    </p>
                    <p className="text-xs text-secondary mt-1">
                      Across {consolidatedData.total_portfolios} portfolios
                    </p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                    <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Portfolio Card */}
        <div className="card p-8 mb-8 shadow-theme">
          <div className="flex items-center mb-6">
            <div className="bg-accent/10 p-3 rounded-xl mr-4">
              <PlusIcon className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary">Create New Portfolio</h2>
              <p className="text-secondary">Start tracking a new investment portfolio</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Portfolio Name (e.g., Tech Stocks, Dividend Portfolio)"
              className="flex-1 px-4 py-3 bg-surface border border-default rounded-xl focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-primary placeholder:text-tertiary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreatePortfolio()}
            />
            <button
              onClick={handleCreatePortfolio}
              disabled={isCreating || !name.trim()}
              className="px-8 py-3 btn-primary rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-theme whitespace-nowrap"
            >
              {isCreating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                <>Create Portfolio</>
              )}
            </button>
          </div>

          {msg && (
            <div className={`mt-4 p-4 rounded-xl ${
              msg.includes("success") 
                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
            }`}>
              {msg}
            </div>
          )}
        </div>

        {/* Portfolios Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary mb-8">Your Portfolios</h2>
          
          {rows.length === 0 ? (
            <div className="card p-16 text-center shadow-theme">
              <div className="bg-surface-secondary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <PieChartIcon className="w-10 h-10 text-tertiary" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">No portfolios yet</h3>
              <p className="text-secondary mb-8 max-w-md mx-auto">Create your first portfolio to start tracking your investments and building wealth</p>
              <button 
                onClick={() => document.querySelector('input')?.focus()}
                className="px-8 py-3 btn-primary rounded-xl transition-all duration-200 shadow-theme"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rows.map(portfolio => (
                <div 
                  key={portfolio.id} 
                  className="card shadow-theme hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
                  onClick={() => window.location.href = `/portfolios/${portfolio.id}`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-accent/10 p-3 rounded-xl mr-3">
                          <PieChartIcon className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary text-lg">{portfolio.name}</h3>
                          <p className="text-sm text-tertiary">{portfolio.base_currency}</p>
                        </div>
                      </div>
                      <Eye className="w-5 h-5 text-tertiary group-hover:text-accent transition-colors" />
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-secondary">Invested Value</span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(portfolio.total_cost)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-secondary">Current Value</span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(portfolio.total_value)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-secondary">Holdings</span>
                        <span className="font-semibold text-primary">
                          {portfolio.holdings_count || 0}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-default">
                        <span className="text-sm text-secondary">Unrealized P&L</span>
                        <span className={`font-semibold ${getPnLColor(portfolio.unrealized_pnl)}`}>
                          {formatCurrency(portfolio.unrealized_pnl)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-tertiary">
                        Click to view details
                      </div>
                      <ArrowRightIcon className="w-4 h-4 text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}