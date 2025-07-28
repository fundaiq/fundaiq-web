'use client';

export default function DCFTable({ table }) {
  if (!table || !Array.isArray(table) || table.length === 0) {
    return <p className="text-red-500 text-sm">⚠️ No DCF cash flow data available.</p>;
  }

  return (
    <div>
      <h3 className="font-semibold mt-4 mb-2">📊 DCF Cash Flow Table</h3>
      <div className="overflow-auto">
        <table className="w-full text-sm border">
          <thead>
            <tr>
              {Object.keys(table[0]).map((key) => (
                <th key={key} className="border p-1 whitespace-nowrap">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td key={j} className="border p-1 text-right">{val.toLocaleString()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
