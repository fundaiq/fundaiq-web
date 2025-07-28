'use client';

export default function ValuationSummary({ valuation }) {
  if (!valuation || typeof valuation.enterprise_value !== 'number') {
    return <p className="text-red-500">⚠️ Incomplete valuation data.</p>;
  }

  return (
    <div className="space-y-2">
      <p><strong>Enterprise Value:</strong> ₹{valuation.enterprise_value.toLocaleString()}</p>
      <p><strong>Equity Value:</strong> ₹{valuation.equity_value.toLocaleString()}</p>
      <p><strong>Fair Value/Share:</strong> ₹{valuation.fair_value_per_share.toLocaleString()}</p>
      <p><strong>Terminal PV:</strong> ₹{valuation.terminal_value_pv.toLocaleString()}</p>
      <p><strong>Terminal Weight:</strong> {valuation.terminal_weight}%</p>
    </div>
  );
}
