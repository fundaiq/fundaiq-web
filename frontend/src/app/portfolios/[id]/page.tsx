// Fixed portfolio-[id]-page.tsx with proper modal props
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiFetch from "@/app/lib/api"; 
import {
  ArrowLeftIcon,
  PlusIcon,
  PieChartIcon,
  CalendarIcon,
  ActivityIcon,
  InfoIcon,
  RefreshCwIcon,
  UploadIcon,
} from "lucide-react";

import { Summary, Transaction, NewTransaction } from "../../../types/portfolio";
import { formatCurrency, formatNumber, getPnLColor } from "../../../utils/portfolio";
import PortfolioSummary from "../../../components/portfolio/PortfolioSummary";
import TransactionModal from "../../../components/portfolio/TransactionModal";
import CsvImportModal from "../../../components/portfolio/import/CsvImportModal";
import TransactionsTable from "../../../components/portfolio/TransactionsTable";

export default function PortfolioDetailPage() {
  const params = useParams<{ id: string }>();
  const pid = params.id;
  const [data, setData] = useState<Summary | null>(null);
  const [tx, setTx] = useState<NewTransaction>({
    trade_date: "",
    symbol: "",
    side: "BUY",
    quantity: "1",
    price: "0",
    fees: "0",
    trade_ccy: "INR",
    fx_rate: "",
  });
  const [txRows, setTxRows] = useState<Transaction[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [importing, setImporting] = useState(false);

  async function loadAll() {
    try {
      setLoading(true);
      const s = await apiFetch(`/portfolios/${pid}`);
      setData(s);
      const t = await apiFetch(`/portfolios/${pid}/tx`);
      setTxRows(t);
      setMsg("");
    } catch (e: any) {
      setMsg("Load failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (pid) loadAll();
  }, [pid]);

  const handleSaveTransaction = async () => {
    if (!tx.trade_date || !tx.symbol) {
      setMsg("Please fill in required fields (Date and Symbol)");
      return;
    }

    setSaving(true);
    try {
      const txData = {
        ...tx,
        fx_rate: tx.fx_rate || undefined,
      };

      await apiFetch(`/portfolios/${pid}/tx`, {
        method: "POST",
        body: JSON.stringify(txData),
      });

      await loadAll(); // Reload all data
      setShowAddTransaction(false);
      
      // Reset form
      setTx({
        trade_date: "",
        symbol: "",
        side: "BUY",
        quantity: "1",
        price: "0",
        fees: "0",
        trade_ccy: "INR",
        fx_rate: "",
      });
      
      setMsg("Transaction added successfully!");
    } catch (e: any) {
      setMsg("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTransactionUpdate = () => {
    loadAll(); // Reload data after any transaction update
  };

  // ✅ Fixed CSV Import Handler
  const handleCsvImport = async (transactions: NewTransaction[]) => {
    setImporting(true);
    try {
      // Import all transactions
      for (const transaction of transactions) {
        await apiFetch(`/portfolios/${pid}/tx`, {
          method: "POST",
          body: JSON.stringify(transaction),
        });
      }
      
      await loadAll(); // Reload data
      setMsg(`Successfully imported ${transactions.length} transaction(s)!`);
    } catch (e: any) {
      setMsg("Import failed: " + e.message);
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-surface-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-surface-secondary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Portfolio not found</h1>
          <p className="text-secondary">The requested portfolio could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-surface-secondary">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 backdrop-blur-sm border-b border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-6">
            {/* Portfolio Info */}
            <div className="flex items-center mb-6 lg:mb-0">
              <a
                href="/portfolios"
                className="mr-6 p-2 rounded-xl bg-surface-secondary/80 hover:bg-surface-secondary transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-secondary" />
              </a>
              <div>
                <h1 className="text-3xl font-bold text-primary flex items-center">
                  <PieChartIcon className="w-8 h-8 mr-3 text-accent" />
                  {data.name}
                </h1>
                <p className="text-secondary mt-1 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={loadAll}
                disabled={refreshing}
                className="px-6 py-3 bg-surface-secondary text-secondary rounded-xl hover:bg-surface-secondary/80 transition-all duration-200 flex items-center shadow-theme"
              >
                <RefreshCwIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {/* ✅ Fixed CSV Import Button */}
              <button
                onClick={() => setShowCsvImport(true)}
                className="px-6 py-3 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 flex items-center shadow-theme"
              >
                <UploadIcon className="w-4 h-4 mr-2" />
                Import CSV
              </button>
              
              {/* ✅ Fixed Add Transaction Button */}
              <button
                onClick={() => setShowAddTransaction(true)}
                className="px-6 py-3 btn-primary rounded-xl transition-all duration-200 flex items-center shadow-theme"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary Cards */}
        <PortfolioSummary data={data} />

        {/* Success/Error Messages */}
        {msg && (
          <div className={`p-4 rounded-xl mb-8 ${
            msg.includes("success") 
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
          }`}>
            {msg}
          </div>
        )}

        {/* Note */}
        {data.totals?.note && (
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-8">
            <p className="text-accent text-sm">{data.totals.note}</p>
          </div>
        )}

        {/* Holdings Table */}
        <div className="card shadow-theme overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-default">
            <h2 className="text-2xl font-semibold text-primary flex items-center">
              <PieChartIcon className="w-6 h-6 mr-3 text-accent" />
              Holdings ({data.holdings?.length || 0})
            </h2>
          </div>

          {!data.holdings || data.holdings.length === 0 ? (
            <div className="p-12 text-center">
              <InfoIcon className="w-16 h-16 text-secondary/50 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-secondary mb-2">No Holdings Yet</h3>
              <p className="text-tertiary">Add transactions to see your portfolio holdings.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-secondary/50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-secondary">Symbol</th>
                    <th className="text-right py-4 px-6 font-semibold text-secondary">Quantity</th>
                    <th className="text-right py-4 px-6 font-semibold text-secondary">Avg Price</th>
                    <th className="text-right py-4 px-6 font-semibold text-secondary">Current Price</th>
                    <th className="text-right py-4 px-6 font-semibold text-secondary">Market Value</th>
                    <th className="text-right py-4 px-6 font-semibold text-secondary">P&L</th>
                    <th className="text-right py-4 px-6 font-semibold text-secondary">P&L %</th>
                    <th className="text-right py-4 px-6 font-semibold text-secondary">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {data.holdings.map((holding, index) => (
                    <tr key={index} className="border-t border-default hover:bg-surface-secondary/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-primary">{holding.symbol}</div>
                      </td>
                      <td className="text-right py-4 px-6 text-primary">
                        {formatNumber(holding.quantity || 0)}
                      </td>
                      <td className="text-right py-4 px-6 text-primary">
                        {formatCurrency(holding.avg_price || 0)}
                      </td>
                      <td className="text-right py-4 px-6 text-primary">
                        {holding.current_price ? formatCurrency(holding.current_price) : "₹--"}
                      </td>
                      <td className="text-right py-4 px-6 text-primary">
                        {holding.market_value ? formatCurrency(holding.market_value) : "₹--"}
                      </td>
                      <td className={`text-right py-4 px-6 font-medium ${getPnLColor(holding.unrealized_pnl)}`}>
                        {holding.unrealized_pnl ? formatCurrency(holding.unrealized_pnl) : "₹--"}
                      </td>
                      <td className={`text-right py-4 px-6 font-medium ${getPnLColor(holding.unrealized_pnl_pct)}`}>
                        {holding.unrealized_pnl_pct ? `${parseFloat(holding.unrealized_pnl_pct).toFixed(2)}%` : "--"}
                      </td>
                      <td className="text-right py-4 px-6 text-primary">
                        {holding.weight_pct ? `${parseFloat(holding.weight_pct).toFixed(2)}%` : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transactions Table with Inline Editing */}
        <div className="card shadow-theme overflow-hidden">
          <div className="px-8 py-6 border-b border-default">
            <h2 className="text-2xl font-semibold text-primary flex items-center">
              <ActivityIcon className="w-6 h-6 mr-3 text-accent" />
              Transaction History ({txRows.length})
            </h2>
          </div>

          <TransactionsTable 
            pid={pid} 
            onTransactionUpdate={handleTransactionUpdate}
          />
        </div>
      </div>

      {/* ✅ Fixed Modal Props */}
      {showAddTransaction && (
        <TransactionModal
          show={showAddTransaction}
          tx={tx}
          setTx={setTx}
          onSave={handleSaveTransaction}
          onClose={() => setShowAddTransaction(false)}
          saving={saving}
          baseCurrency="INR"
        />
      )}

      {showCsvImport && (
        <CsvImportModal
          show={showCsvImport}
          onClose={() => setShowCsvImport(false)}
          onImport={handleCsvImport}
          importing={importing}
        />
      )}
    </div>
  );
}