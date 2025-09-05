// components/portfolio/TransactionModal.tsx
import { PlusIcon, SaveIcon, AlertCircleIcon } from "lucide-react";
import { NewTransaction } from "../../types/portfolios";
import { formatCurrency } from "../../utils/portfolio";
import TickerInputWithSuggestions from "./TickerInputWithSuggestions";

interface TransactionModalProps {
  show: boolean;
  tx: NewTransaction;
  setTx: (tx: NewTransaction) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  baseCurrency?: string;
}

export default function TransactionModal({ 
  show, 
  tx, 
  setTx, 
  onSave, 
  onClose, 
  saving, 
  baseCurrency = 'INR'
}: TransactionModalProps) {
  if (!show) return null;

  const resetForm = () => {
    setTx({
      trade_date: "", 
      symbol: "", 
      side: "BUY", 
      quantity: "1", 
      price: "0", 
      fees: "0", 
      trade_ccy: "INR",
      fx_rate: ""
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 w-full max-w-2xl border border-white/50 shadow-2xl">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
          <PlusIcon className="w-6 h-6 mr-3 text-indigo-600" />
          Add New Transaction
        </h3>
        
        <div className="space-y-6">
          {/* Form validation message */}
          {(!tx.trade_date || !tx.symbol) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center">
                <AlertCircleIcon className="w-5 h-5 text-amber-600 mr-2" />
                <p className="text-amber-800 text-sm">
                  Please fill in required fields: Date and Symbol
                </p>
              </div>
            </div>
          )}

          {/* Row 1: Date, Symbol, Side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={tx.trade_date}
                onChange={e => setTx({...tx, trade_date: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symbol <span className="text-red-500">*</span>
              </label>
              <TickerInputWithSuggestions
                value={tx.symbol}
                onChange={(value) => setTx({...tx, symbol: value})}
                placeholder="Start typing company name or ticker..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Side</label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={tx.side}
                onChange={e => setTx({...tx, side: e.target.value})}
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
                <option value="DIV">DIVIDEND</option>
                <option value="SPLIT">SPLIT</option>
                <option value="BONUS">BONUS</option>
                <option value="FEE">FEE</option>
              </select>
            </div>
          </div>

          {/* Row 2: Quantity, Price, Fees */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={tx.quantity}
                onChange={e => setTx({...tx, quantity: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price per unit</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={tx.price}
                onChange={e => setTx({...tx, price: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fees & Charges</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={tx.fees}
                onChange={e => setTx({...tx, fees: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Row 3: Currency, FX Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trading Currency</label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={tx.trade_ccy}
                onChange={e => setTx({...tx, trade_ccy: e.target.value})}
              >
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exchange Rate (optional)</label>
              <input
                type="number"
                min="0"
                step="0.0001"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Auto-calculated if empty"
                value={tx.fx_rate || ""}
                onChange={e => setTx({...tx, fx_rate: e.target.value})}
              />
              <p className="text-xs text-gray-500 mt-1">Rate to convert to {baseCurrency}</p>
            </div>
          </div>

          {/* Total Calculation Display */}
          {tx.quantity && tx.price && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Transaction Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Gross Amount:</span>
                  <span className="float-right font-medium">
                    {formatCurrency((parseFloat(tx.quantity) * parseFloat(tx.price)).toString())}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Fees:</span>
                  <span className="float-right font-medium">
                    {formatCurrency(tx.fees)}
                  </span>
                </div>
                <div className="col-span-2 border-t pt-2">
                  <span className="text-gray-900 font-semibold">Net Amount:</span>
                  <span className="float-right font-semibold">
                    {tx.side === 'BUY' 
                      ? formatCurrency((parseFloat(tx.quantity) * parseFloat(tx.price) + parseFloat(tx.fees)).toString())
                      : formatCurrency((parseFloat(tx.quantity) * parseFloat(tx.price) - parseFloat(tx.fees)).toString())
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !tx.trade_date || !tx.symbol || !tx.quantity || !tx.price}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving Transaction...
              </>
            ) : (
              <>
                <SaveIcon className="w-4 h-4 mr-2" />
                Save Transaction
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}