'use client';

export default function EPSProjectionTable({ data }: any) {
  if (!data?.projection_table) return null;

  return (
    <div className="overflow-x-auto text-sm mt-6">
      <h3 className="text-md font-semibold mb-2">EPS Projection Table</h3>
      <table className="w-full table-auto border border-gray-400 dark:border-zinc-600">
        <thead className="bg-gray-100 dark:bg-zinc-700">
          <tr>
            {['Year', 'Revenue', 'EBIT', 'Interest', 'Tax', 'Net Profit', 'EPS', 'PE (Projected)'].map((label) => (
              <th key={label} className="border border-gray-400 dark:border-zinc-600 px-2 py-1 font-medium">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.projection_table.map((row: any, i: number) => (
            <tr key={i} className="text-center">
              <td className="border border-gray-400 dark:border-zinc-600 px-2 py-1">{row.year}</td>
              <td className="border border-gray-400 dark:border-zinc-600 px-2 py-1">{row.revenue}</td>
              <td className="border border-gray-400 dark:border-zinc-600 px-2 py-1">{row.ebit}</td>
              <td className="border border-gray-400 dark:border-zinc-600 px-2 py-1">{row.interest}</td>
              <td className="border border-gray-400 dark:border-zinc-600 px-2 py-1">{row.tax}</td>
              <td className="border border-gray-400 dark:border-zinc-600 px-2 py-1">{row.net_profit}</td>
              <td className="border border-gray-400 dark:border-zinc-600 px-2 py-1">{row.eps}</td>
              <td className="border border-gray-400 dark:border-zinc-600 px-2 py-1">{row.pe || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
