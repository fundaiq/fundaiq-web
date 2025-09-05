'use client';
import { CheckCircleIcon } from "lucide-react";
import { NewTransaction } from "@/types/portfolio";

type Props = {
  transactions: NewTransaction[];
};

export default function PreviewStep({ transactions }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
        <div className="flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
          <div>
            <h4 className="font-medium text-green-900 dark:text-green-200">Ready to Import</h4>
            <p className="text-sm text-green-700 dark:text-green-300">Found {transactions.length} valid transaction(s) ready for import</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border-default border overflow-hidden">
        <div className="px-6 py-4 bg-surface-secondary border-b border-default">
          <h4 className="font-medium text-primary">Transaction Preview</h4>
        </div>
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-sm">
            <thead className="bg-surface-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase">Yahoo Ticker</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase">Side</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-tertiary uppercase">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-tertiary uppercase">Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-tertiary uppercase">Fees</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase">Currency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((tx, index) => (
                <tr key={index} className="hover:bg-surface-secondary">
                  <td className="px-4 py-3 text-primary">{tx.trade_date}</td>
                  <td className="px-4 py-3 font-medium text-primary">{tx.symbol}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tx.side === 'BUY' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      tx.side === 'SELL' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>{tx.side}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-primary">{parseFloat(tx.quantity).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-primary">₹{parseFloat(tx.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-primary">₹{parseFloat(tx.fees).toLocaleString()}</td>
                  <td className="px-4 py-3 text-primary"><span className="px-2 py-1 bg-surface-secondary text-secondary rounded text-xs">{tx.trade_ccy}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}